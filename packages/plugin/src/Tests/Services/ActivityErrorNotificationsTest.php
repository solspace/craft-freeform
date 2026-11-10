<?php

namespace Solspace\Freeform\Tests\Services;

use craft\mail\Message;
use Monolog\Logger;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogRecord;
use Solspace\Freeform\Library\Logging\Handlers\ErrorNotificationHandler;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\ErrorNotificationsService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\caching\ArrayCache;

#[CoversClass(ActivityService::class)]
#[CoversClass(ErrorNotificationsService::class)]
#[CoversClass(ErrorNotificationHandler::class)]
class ActivityErrorNotificationsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['activity'])]
    #[TestWith(['classic'])]
    #[TestWith(['none'])]
    public function testDirectErrorsNotifyIndependentlyOfRecordingStyleAndNeverNotifyForWarnings(string $style): void
    {
        $previous = \Yii::$app;
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $settings->loggingStyle = $style;
        $settings->activityMode = 'custom';
        $settings->activityEvents = ['submission' => true];
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $provider->method('isErrorNotificationEnabled')->willReturn(true);
        $notifications = $this->createMock(ErrorNotificationsService::class);
        $notifications->expects(self::once())->method('handleActivity')->with('email-error', 12, 42, ['reasonCode' => 7]);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        app()->instance(Freeform::class, $plugin);
        $plugin->method('__get')->with('errorNotifications')->willReturn($notifications);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        try {
            $service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService'])->getMock();
            $service->method('getSettingsService')->willReturn($provider);
            $service->record('email-error', 12, 42, ['reasonCode' => 7]);
            $service->record('warning');
            $service->record('error', notifyErrors: false);
        } finally {
            \Yii::$app = $previous;
        }
    }

    public function testActivityAlertsUseSanitizedContextAndStableCooldownFingerprints(): void
    {
        $records = [];
        $service = $this->getMockBuilder(ErrorNotificationsService::class)->onlyMethods(['handle'])->getMock();
        $service->method('handle')->willReturnCallback(static function ($record) use (&$records) { $records[] = $record; });
        foreach ([12, 56] as $duration) {
            $service->handleActivity('email-error', 12, 42, ['reasonCode' => 7, 'durationMs' => $duration, 'password' => 'SECRET', 'diagnostics' => ['message' => 'Rejected jane@example.test password=SECRET']]);
        }
        self::assertCount(2, $records);
        self::assertStringNotContainsString('SECRET', json_encode($records[0]->context));
        self::assertStringNotContainsString('jane@example.test', json_encode($records[0]->context));
        $fingerprint = new \ReflectionMethod(ErrorNotificationsService::class, 'buildFingerprint');
        self::assertSame($fingerprint->invoke($service, $records[0], null, $records[0]->context), $fingerprint->invoke($service, $records[1], null, $records[1]->context));
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testDeliveryCooldownPreventsRecursionAndAlwaysRestoresTemplateMode(bool $fail): void
    {
        $previousApp = \Craft::$app;
        $previousYii = \Yii::$app;
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getErrorNotificationRecipients')->willReturn(RecipientCollection::fromArray(['qa@example.test']));
        $service = $this->getMockBuilder(ErrorNotificationsService::class)->onlyMethods(['getSettingsService', 'getLogReview'])->getMock();
        $service->method('getSettingsService')->willReturn($provider);
        $service->method('getLogReview')->willReturn(null);
        $record = new FreeformLogRecord('A test error', 'test', new \DateTimeImmutable(), [], [], 400, 'ERROR');
        $mailer = $this->getMockBuilder(MailerService::class)->disableOriginalConstructor()->onlyMethods(['compileMessage', 'processRecipients'])->getMock();
        if ($fail) {
            $mailer->expects(self::once())->method('compileMessage')->willThrowException(new \RuntimeException('Compile failure'));
        } else {
            $mailer->expects(self::once())->method('compileMessage')->willReturn($this->createStub(Message::class));
        }
        $mailer->method('processRecipients')->willReturn(['qa@example.test']);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        app()->instance(Freeform::class, $plugin);
        $plugin->method('__get')->with('mailer')->willReturn($mailer);
        $view = new class {
            public const TEMPLATE_MODE_CP = 'cp';
            public string $templateMode = 'site';

            public function getTemplateMode(): string
            {
                return $this->templateMode;
            }
        };
        $transport = new class($service, $record) {
            public int $calls = 0;

            public function __construct(private ErrorNotificationsService $service, private FreeformLogRecord $record) {}

            public function send($message): bool
            {
                ++$this->calls;
                $this->service->handle($this->record);

                return true;
            }
        };
        \Craft::$app = \Yii::$app = new class($plugin, $view, $transport) {
            public array $loadedModules;
            private ArrayCache $cache;

            public function __construct($plugin, public object $view, private object $mailer)
            {
                $this->loadedModules = [Freeform::class => $plugin];
                $this->cache = new ArrayCache();
            }

            public function getCache(): object
            {
                return $this->cache;
            }

            public function getRequest(): object
            {
                return new \stdClass();
            }

            public function getMailer(): object
            {
                return $this->mailer;
            }

            public function getSites(): object
            {
                return new class {
                    public function getCurrentSite(): object
                    {
                        return (object) ['name' => 'QA', 'handle' => 'qa', 'baseUrl' => 'https://craft5.test'];
                    }
                };
            }
        };

        try {
            $service->handle($record);
            $service->handle($record);
            self::assertSame($fail ? 0 : 1, $transport->calls);
            self::assertSame('site', $view->templateMode);
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYii;
        }
    }

    public function testCompanionLoggerErrorDoesNotSendASecondCriticalAlert(): void
    {
        $notifications = $this->createMock(ErrorNotificationsService::class);
        $notifications->expects(self::once())->method('handle')->with(self::callback(static fn (FreeformLogRecord $record) => 'Unbridged error' === $record->message));
        $logger = new Logger('test');
        $logger->pushHandler(new ErrorNotificationHandler($notifications));
        $logger->error('Already reported by Activity', ['activityRecorded' => true]);
        $logger->error('Unbridged error');
    }
}
