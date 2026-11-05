<?php

namespace Solspace\Freeform\Tests\Library\Logging;

use craft\web\Request;
use Monolog\Logger;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\LogsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Logging\FreeformLogRecord;
use Solspace\Freeform\Library\Logging\LoggerFactory;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\ErrorNotificationsService;
use Solspace\Freeform\Services\LoggerService;
use yii\web\Response;

#[CoversClass(LoggerFactory::class)]
#[CoversClass(FreeformLogger::class)]
#[CoversClass(LoggerService::class)]
#[CoversClass(LogsController::class)]
class LoggerRoutingTest extends TestCase
{
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
        $this->settings->technicalFileLogging = '1';
        $this->settings->loggingStyle = 'classic';
        $this->settings->errorNotificationRecipients = 'qa@example.test';
        $this->activity = $this->createMock(ActivityService::class);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get', 'getSettings', 'get'])->getMock();
        $plugin->method('get')->with('activity')->willReturn($this->activity);
        $plugin->method('getSettings')->willReturn($this->settings);
        $plugin->method('__get')->with('errorNotifications')->willReturn($this->notifications);
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

    #[TestWith(['freeform-email.log', Logger::DEBUG, 4])]
    #[TestWith(['freeform-email.log', Logger::INFO, 3])]
    #[TestWith(['freeform-email.log', Logger::ERROR, 0])]
    #[TestWith(['freeform-integrations.log', Logger::DEBUG, 4])]
    #[TestWith(['freeform-integrations.log', Logger::INFO, 3])]
    #[TestWith(['freeform-integrations.log', Logger::ERROR, 0])]
    public function testErrorsAreRoutedExclusivelyToTheErrorLog(string $file, int $level, int $expectedDetails): void
    {
        $this->notifications->expects(self::exactly(4))->method('handle')->willReturnCallback(static function (FreeformLogRecord $record) {
            self::assertSame('[redacted]', $record->context['password']);
        });
        $logger = $this->service->getLogger('routing-test', $file, $level);
        foreach (['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'] as $severity) {
            $logger->log($severity, $severity.' message', ['password' => 'secret-password']);
        }

        $errors = $this->service->getLogReader()->getLines(20, readFromEnd: false);
        self::assertSame(['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'], array_map(static fn ($line) => $line->getLevel(), $errors));
        foreach ($errors as $error) {
            self::assertSame('routing-test', $error->getChannel());
            self::assertSame('[redacted]', $error->getContext()['password']);
            self::assertNotEmpty($error->getExtra()['requestId']);
        }

        $details = $this->service->getLogReader($file)->getLines(20, readFromEnd: false);
        self::assertCount($expectedDetails, $details);
        self::assertSame(\array_slice(['DEBUG', 'INFO', 'NOTICE', 'WARNING'], 4 - $expectedDetails), array_map(static fn ($line) => $line->getLevel(), $details));
        self::assertSame(4, $this->service->getErrorLogLineCount());

        $this->service->clearLogs();
        self::assertSame(0, $this->service->getErrorLogLineCount());
        self::assertCount($expectedDetails, $this->service->getLogReader($file));
    }

    public function testDefaultLoggerWritesEachErrorOnce(): void
    {
        $this->notifications->expects(self::once())->method('handle');
        $logger = $this->service->getLogger('default-test');
        $logger->info('Ignored detail');
        $logger->error('One error');

        self::assertCount(1, $this->service->getLogReader());
        self::assertSame(1, $this->service->getErrorLogLineCount());
    }

    public function testTechnicalFilesAreNotRecreatedWhenFileLoggingIsDisabled(): void
    {
        $this->settings->technicalFileLogging = '0';
        $this->notifications->expects(self::once())->method('handle');
        $logger = $this->service->getLogger('files-disabled', 'freeform-email.log', Logger::DEBUG);
        $logger->debug('Detailed content');
        $logger->error('An error that still triggers configured error notifications');
        self::assertSame([], glob($this->logPath.'/*'));
        self::assertSame([], $this->service->getExistingLogs());
    }

    public function testNoneDoesNotWriteFilesAndKeepsErrorNotificationsIndependent(): void
    {
        $this->settings->loggingStyle = 'none';
        $this->notifications->expects(self::once())->method('handle');
        $this->service->getLogger('none-style', 'freeform-email.log', Logger::DEBUG)->error('A failure');
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testActivityStyleDoesNotWriteFilesEvenWithClassicPreferenceEnabled(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->settings->technicalFileLogging = '1';
        $this->notifications->expects(self::once())->method('handle');
        $logger = $this->service->getLogger('activity-exclusive', 'freeform-email.log', Logger::DEBUG);
        $logger->info('Private detail');
        $logger->error('A failure');
        self::assertSame([], glob($this->logPath.'/*'));
        self::assertSame('1', $this->settings->technicalFileLogging);
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
        $logger = $this->service->getLogger('typed-debug', 'freeform-integrations.log');
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
        $this->settings->technicalFileLogging = '0';
        $this->settings->errorNotificationRecipients = null;
        $this->notifications->expects(self::never())->method('handle');
        $this->activity->expects(self::once())->method('record')->with('email-error', null, null, self::callback(static fn ($metadata) => !str_contains(json_encode($metadata), 'private@example.test') && !str_contains(json_encode($metadata), 'response')));
        $payload = new class implements \JsonSerializable {
            public function jsonSerialize(): mixed
            {
                throw new \RuntimeException('Private payload must never be serialized.');
            }
        };
        $logger = $this->service->getLogger('activity-only', 'freeform-email.log');
        $logger->error('Arbitrary private error message', ['response' => $payload, 'email' => 'private@example.test']);
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testTypedMarkersAddOnlyCataloguedContextToActivity(): void
    {
        $this->settings->loggingStyle = 'activity';
        $this->settings->technicalFileLogging = '0';
        $this->settings->errorNotificationRecipients = null;
        $this->activity->expects(self::once())->method('record')->with('warning', 12, null, self::callback(static fn ($metadata) => 11 === $metadata['reasonCode'] && !str_contains(json_encode($metadata), 'private@example.test')));
        $logger = $this->service->getLogger('typed-warning');
        $logger->warning('SECRET warning text', ['activityReason' => 11, 'activityFormId' => 12, 'activitySubmissionId' => 'SECRET', 'recipient' => 'SECRET']);
        self::assertSame([], glob($this->logPath.'/*'));
    }

    public function testSameCategoryCanUseDifferentFilesAndThresholds(): void
    {
        $email = $this->service->getLogger('shared-category', 'freeform-email.log', Logger::INFO);
        $integration = $this->service->getLogger('shared-category', 'freeform-integrations.log', Logger::DEBUG);
        $emailDebug = $this->service->getLogger('shared-category', 'freeform-email.log', Logger::DEBUG);
        $email->debug('Ignored');
        $email->info('Email info', ['test' => true]);
        $integration->debug('Integration debug', ['test' => true]);
        $emailDebug->debug('Email debug', ['test' => true]);

        self::assertSame(['Email info', 'Email debug'], array_map(static fn ($line) => $line->getMessage(), $this->service->getLogReader('freeform-email.log')->getLines(20, readFromEnd: false)));
        self::assertSame('Integration debug', $this->service->getLogReader('freeform-integrations.log')->getLines()[0]->getMessage());
        self::assertSame(0, $this->service->getErrorLogLineCount());
    }

    public function testClassicFilesAndErrorNotificationsReceiveSanitizedTextAndContext(): void
    {
        $this->notifications->expects(self::once())->method('handle')->willReturnCallback(static function (FreeformLogRecord $record) {
            self::assertStringNotContainsString('jane@example.com', $record->message);
            self::assertSame('[redacted]', $record->context['password']);
        });
        $this->service->getLogger('sanitized-classic', 'freeform-email.log', Logger::DEBUG)
            ->error('Rejected jane@example.com using api_key=sk_live_1234567890abcdef', ['password' => 'private-password', 'response_body' => 'private-body'])
        ;
        $contents = file_get_contents($this->logPath.'/freeform.log');
        foreach (['jane@example.com', '1234567890abcdef', 'private-password', 'private-body'] as $private) {
            self::assertStringNotContainsString($private, $contents);
        }
        self::assertStringContainsString('j***@example.com', $contents);
        self::assertStringContainsString('sk_live_****cdef', $contents);
    }

    public function testErrorCountUsesOnlyTheErrorLogAndIncludesEveryErrorSeverity(): void
    {
        $entry = '[2026-10-28T12:00:00.000000+00:00] test.%s: message [] []'."\n";
        file_put_contents($this->logPath.'/freeform.log', implode('', array_map(static fn ($severity) => \sprintf($entry, $severity), ['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY', 'WARNING'])));
        file_put_contents($this->logPath.'/freeform-email.log', \sprintf($entry, 'ERROR'));
        file_put_contents($this->logPath.'/freeform-integrations.log', \sprintf($entry, 'ERROR'));

        self::assertSame(4, $this->service->getErrorLogLineCount());
        $this->service->clearLogs('freeform-integrations.log');
        self::assertCount(0, $this->service->getLogReader('freeform-integrations.log'));
        self::assertCount(1, $this->service->getLogReader('freeform-email.log'));
        self::assertSame(4, $this->service->getErrorLogLineCount());
        $this->service->clearLogs();
        self::assertSame(0, $this->service->getErrorLogLineCount());
    }

    #[TestWith(['emails', 'freeform-email.log'])]
    #[TestWith(['integrations', 'freeform-integrations.log'])]
    #[TestWith(['', 'freeform.log'])]
    public function testClearActionRemovesOnlyThePostedLog(string $category, string $expectedFile): void
    {
        $files = ['freeform.log', 'freeform-email.log', 'freeform-integrations.log'];
        foreach ($files as $file) {
            file_put_contents($this->logPath.'/'.$file, 'Existing log entry');
        }

        $request = $this->createMock(Request::class);
        $request->method('getBodyParam')->with('category')->willReturn($category);
        $request->method('getIsConsoleRequest')->willReturn(true);
        $request->method('getIsAjax')->willReturn(false);
        \Craft::$app->request = $request;

        $response = $this->createMock(Response::class);
        $controller = $this->getMockBuilder(LogsController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['requirePostRequest', 'getLoggerService', 'redirectToPostedUrl'])
            ->getMock()
        ;
        $controller->expects(self::once())->method('requirePostRequest');
        $controller->method('getLoggerService')->willReturn($this->service);
        $controller->expects(self::once())->method('redirectToPostedUrl')->willReturn($response);

        self::assertSame($response, $controller->actionClear());
        foreach ($files as $file) {
            self::assertSame($file !== $expectedFile, file_exists($this->logPath.'/'.$file));
        }
    }

    public function testLegacyLinksExistOnlyForNonemptyFilesAndDisappearAfterClearing(): void
    {
        self::assertSame([], $this->service->getExistingLogs());
        file_put_contents($this->logPath.'/freeform.log', '');
        self::assertSame([], $this->service->getExistingLogs());
        file_put_contents($this->logPath.'/freeform-email.log', 'An old entry');
        self::assertSame(['email-log' => 'Emails'], $this->service->getExistingLogs());
        $this->service->clearLogs('freeform-email.log');
        self::assertSame([], $this->service->getExistingLogs());
    }

    public function testActiveClassicNavigationIncludesMissingAndEmptyLogsWithoutCreatingFiles(): void
    {
        $links = ['error-log' => 'Errors', 'integrations-log' => 'Integrations', 'email-log' => 'Emails'];
        self::assertSame($links, $this->service->getLogNavigation(true));
        self::assertSame([], glob($this->logPath.'/*'));
        file_put_contents($this->logPath.'/freeform-email.log', '');
        self::assertSame($links, $this->service->getLogNavigation(true));
        self::assertSame([], $this->service->getLogNavigation());
        self::assertSame(0, $this->service->getLogReader('freeform-integrations.log')->count());
    }
}
