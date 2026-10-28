<?php

namespace Solspace\Freeform\Tests\Library\Logging;

use craft\web\Request;
use Monolog\Logger;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\LogsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Logging\FreeformLogRecord;
use Solspace\Freeform\Library\Logging\LoggerFactory;
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

    protected function setUp(): void
    {
        $this->previousCraftApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->logPath = sys_get_temp_dir().'/freeform-logs-'.bin2hex(random_bytes(8));
        mkdir($this->logPath);

        $this->notifications = $this->createMock(ErrorNotificationsService::class);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
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
            self::assertSame('secr**********', $record->context['password']);
        });
        $logger = $this->service->getLogger('routing-test', $file, $level);
        foreach (['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'] as $severity) {
            $logger->log($severity, $severity.' message', ['password' => 'secret-password']);
        }

        $errors = $this->service->getLogReader()->getLines(20, readFromEnd: false);
        self::assertSame(['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'], array_map(static fn ($line) => $line->getLevel(), $errors));
        foreach ($errors as $error) {
            self::assertSame('routing-test', $error->getChannel());
            self::assertSame('secr**********', $error->getContext()['password']);
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
}
