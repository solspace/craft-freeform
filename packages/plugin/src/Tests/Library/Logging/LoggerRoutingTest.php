<?php

namespace Solspace\Freeform\Tests\Library\Logging;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentStorageService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Logging\FreeformLogRecord;
use Solspace\Freeform\Library\Logging\LoggerFactory;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\ErrorNotificationsService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(LoggerFactory::class)]
#[CoversClass(FreeformLogger::class)]
#[CoversClass(LoggerService::class)]
class LoggerRoutingTest extends TestCase
{
    use UsesCraft6Container;

    private string $logPath;
    private mixed $previousCraftApp;
    private mixed $previousYiiApp;
    private ErrorNotificationsService $notifications;
    private LoggerService $service;
    private Settings $settings;
    private ActivityService $activity;

    protected function setUp(): void
    {
        $this->previousCraftApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->logPath = sys_get_temp_dir().'/freeform-logs-'.bin2hex(random_bytes(8));
        mkdir($this->logPath);

        $this->notifications = $this->createMock(ErrorNotificationsService::class);
        $this->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $this->settings->loggingStyle = 'activity';
        $this->settings->errorNotificationRecipients = 'qa@example.test';
        $this->activity = $this->createMock(ActivityService::class);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get', 'getSettings'])->getMock();
        app()->instance(Freeform::class, $plugin);
        $plugin->method('getSettings')->willReturn($this->settings);
        $plugin->method('__get')->willReturnCallback(fn ($name) => match ($name) {
            'activity' => $this->activity, 'errorNotifications' => $this->notifications
        });
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        \Craft::$app = (object) ['path' => new class($this->logPath) {
            public function __construct(private string $path) {}

            public function getLogPath(): string
            {
                return $this->path;
            }
        }];
        $this->service = new LoggerService();
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousCraftApp;
        \Yii::$app = $this->previousYiiApp;
        foreach (glob($this->logPath.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->logPath);
    }

    #[TestWith(['activity', false])]
    #[TestWith(['activity', true])]
    #[TestWith(['none', false])]
    #[TestWith(['none', true])]
    public function testPaymentStorageFailuresUseConfiguredLoggingWithoutDuplicateActivityOrAlerts(string $style, bool $optInMissing): void
    {
        $this->settings->loggingStyle = $style;
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(12);
        $form->method('getHandle')->willReturn('checkout');
        $form->method('hasOptInPermission')->willReturn(!$optInMissing);
        $general = new GeneralSettings();
        $general->storeData = $optInMissing;
        $settings = $this->createStub(FormSettings::class);
        $settings->method('getGeneral')->willReturn($general);
        $form->method('getSettings')->willReturn($settings);
        $integration = $this->createMock(Stripe::class);
        $integration->method('getId')->willReturn(22);
        $reason = $optInMissing ? ActivityContext::PAYMENT_STORAGE_OPT_IN_REQUIRED : ActivityContext::PAYMENT_STORAGE_DISABLED;
        $this->activity->expects(self::once())->method('record')
            ->with('integration-error', 12, null, ['integrationId' => 22, 'reasonCode' => $reason])
        ;
        $this->notifications->expects(self::never())->method('handle');
        $loggers = $this->createStub(IntegrationLoggerProvider::class);
        $loggers->method('getLogger')->willReturn($this->service->getLogger('payment-storage-'.$style, 'integrations'));
        $storage = new PaymentStorageService($loggers);

        try {
            $storage->assertCanStore($form, $integration, 'Stripe');
            self::fail('The payment must be rejected.');
        } catch (\InvalidArgumentException $exception) {
            self::assertSame('Stripe payments require stored submissions.', $exception->getMessage());
        }
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testNoneDoesNotWriteFilesAndKeepsErrorNotificationsIndependent(): void
    {
        $this->settings->loggingStyle = 'none';
        $this->notifications->expects(self::once())->method('handle');
        $this->service->getLogger('none-style', 'email')->error('A failure');
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testTypedDebugMarkersReachActivityWithoutCapturingOtherDebugRecords(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->activity->expects(self::exactly(2))->method('recordIntegrationDiagnostic')->with(self::callback(static fn ($reason) => \in_array($reason, [ActivityContext::INTEGRATION_NO_MAPPING, ActivityContext::INTEGRATION_CREATED], true)));
        $this->activity->expects(self::never())->method('record');
        $payload = new class implements \JsonSerializable {
            public function jsonSerialize(): mixed
            {
                throw new \RuntimeException('Private debug payload must not be serialized.');
            }
        };
        $logger = $this->service->getLogger('typed-debug', 'integrations');
        $logger->debug('Private payload', ['response' => $payload]);
        $logger->debug('Private marker text', ['activityReason' => ActivityContext::INTEGRATION_NO_MAPPING]);
        $logger->info('Private record contents', ['response' => $payload, 'activityReason' => ActivityContext::INTEGRATION_CREATED]);
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testKnownSubsystemErrorsHaveSpecificSafeDiagnoses(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->activity->expects(self::once())->method('record')->with('error', null, null, self::callback(static fn ($metadata) => ActivityContext::AI_FAILED === $metadata['reasonCode'] && isset($metadata['diagnostics']['message'])));
        $this->service->getLogger('ai')->error('SECRET provider response');
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testActivityOnlyLoggingNeverSerializesPayloadsOrCreatesTechnicalFiles(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->settings->errorNotificationRecipients = null;
        $this->notifications->expects(self::never())->method('handle');
        $this->activity->expects(self::once())->method('record')->with('email-error', null, null, self::callback(static fn ($metadata) => !str_contains(json_encode($metadata), 'private@example.test') && !str_contains(json_encode($metadata), 'response')));
        $payload = new class implements \JsonSerializable {
            public function jsonSerialize(): mixed
            {
                throw new \RuntimeException('Private payload must never be serialized.');
            }
        };
        $logger = $this->service->getLogger('activity-only', 'email');
        $logger->error('Arbitrary private error message', ['response' => $payload, 'email' => 'private@example.test']);
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testTypedMarkersAddOnlyCataloguedContextToActivity(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->settings->errorNotificationRecipients = null;
        $this->activity->expects(self::once())->method('record')->with('warning', 12, null, self::callback(static fn ($metadata) => 11 === $metadata['reasonCode'] && !str_contains(json_encode($metadata), 'private@example.test')));
        $logger = $this->service->getLogger('typed-warning');
        $logger->warning('SECRET warning text', ['activityReason' => 11, 'activityFormId' => 12, 'activitySubmissionId' => 'SECRET', 'recipient' => 'SECRET']);
        self::assertSame([], glob($this->logPath.'/*'));
    }

    #[TestWith(['activity'])]
    #[TestWith(['none'])]
    public function testErrorNotificationsRemainSanitizedWithoutCreatingFiles(string $style): void
    {
        $this->settings->loggingStyle = $style;
        $this->notifications->expects(self::once())->method('handle')->willReturnCallback(static function (FreeformLogRecord $record) {
            self::assertStringNotContainsString('jane@example.com', $record->message);
            self::assertSame('[redacted]', $record->context['password']);
            self::assertArrayNotHasKey('response_body', $record->context);
            self::assertNotEmpty($record->extra['requestId']);
        });
        $this->service->getLogger('sanitized-'.$style, 'email')
            ->error('Rejected jane@example.com using api_key=sk_live_1234567890abcdef', ['password' => 'private-password', 'response_body' => 'private-body'])
        ;
        self::assertSame([], glob($this->logPath.'/*'));
    }

    #[TestWith(['email', 'email-error'])]
    #[TestWith(['integrations', 'integration-error'])]
    #[TestWith(['system', 'error'])]
    public function testSourceRoutesToActivityWithoutConsultingLogFiles(string $source, string $event): void
    {
        $this->activity->expects(self::once())->method('record')->with($event);
        $this->notifications->expects(self::once())->method('handle');
        $this->service->getLogger('source-'.$source, $source)->error('A failure');
        self::assertSame([], glob($this->logPath.'/*'));
    }
}
