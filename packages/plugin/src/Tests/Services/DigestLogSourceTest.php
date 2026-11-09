<?php

namespace Solspace\Freeform\Tests\Services;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\Pro\DigestService;
use Solspace\Freeform\Services\SettingsService;
use yii\db\Connection;

#[CoversClass(DigestService::class)]
class DigestLogSourceTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYii;
    private string $logPath;
    private Connection $db;
    private Settings $settings;
    private DigestService $digest;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYii = \Yii::$app;
        $this->logPath = sys_get_temp_dir().'/freeform-digest-'.bin2hex(random_bytes(6));
        mkdir($this->logPath);
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, resolvedAt TEXT, event TEXT, category TEXT, level TEXT, metadata TEXT, formId INTEGER, submissionId INTEGER, dateCreated TEXT)')->execute();
        $this->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($this->settings);
        $activity = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService'])->getMock();
        $activity->method('getSettingsService')->willReturn($provider);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['getSettings', '__get', 'get'])->getMock();
        $plugin->method('getSettings')->willReturn($this->settings);
        $plugin->method('__get')->with('logger')->willReturn(new LoggerService());
        $plugin->method('get')->with('activity')->willReturn($activity);
        \Craft::$app = \Yii::$app = new class($plugin, $this->db, $this->logPath) {
            public array $loadedModules;
            public object $path;

            public function __construct($plugin, private Connection $db, string $path)
            {
                $this->loadedModules = [Freeform::class => $plugin];
                $this->path = new class($path) {
                    public function __construct(private string $path) {}

                    public function getLogPath(): string
                    {
                        return $this->path;
                    }
                };
            }

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getIsInitialized(): bool
            {
                return false;
            }

            public function getConfig(): object
            {
                return new class {
                    public function getGeneral(): object
                    {
                        return (object) ['cpTrigger' => 'admin', 'omitScriptNameInUrls' => true, 'baseCpUrl' => 'https://craft5.test', 'pathParam' => 'p'];
                    }
                };
            }

            public function getRequest(): object
            {
                return new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
            }
        };
        $this->digest = (new \ReflectionClass(DigestService::class))->newInstanceWithoutConstructor();
    }

    protected function tearDown(): void
    {
        $this->db->close();
        foreach (glob($this->logPath.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->logPath);
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYii;
    }

    public function testActivityDigestUsesRetainedOperationalEventsAndTheirReviewLinks(): void
    {
        $now = gmdate('Y-m-d H:i:s');
        $this->db->createCommand()->batchInsert('freeform_activity', ['event', 'category', 'level', 'metadata', 'dateCreated'], [
            ['email-error', 'email', 'error', json_encode(['reasonCode' => ActivityContext::MAIL_REJECTED]), $now],
            ['warning', 'system', 'warning', '{}', $now],
            ['spam', 'spam', 'warning', '{}', $now],
            ['validation', 'submissions', 'warning', '{}', $now],
            ['error', 'system', 'error', '{}', gmdate('Y-m-d H:i:s', time() - 86400 * 31)],
        ])->execute();
        file_put_contents($this->logPath.'/freeform.log', '['.date('c')."] classic.ERROR: Stale classic failure [] []\n");
        $rows = $this->data(Carbon::now()->subDays(40), Carbon::now()->addMinute());
        self::assertSame(['Warning', 'Error'], array_column($rows, 'level'));
        self::assertStringContainsString('Operational warning', $rows[0]['message']);
        self::assertStringContainsString('Mail transport rejected', $rows[1]['message']);
        self::assertStringContainsString('/admin/freeform/activity?view=events&eventId=1', $rows[1]['url']);
    }

    public function testClassicDigestFiltersPeriodBeforeLimitingAndIncludesWarningsFromTheirFiles(): void
    {
        $this->settings->loggingStyle = 'classic';
        $line = static fn ($date, $level, $message) => '['.$date."] qa.{$level}: {$message} [] []\n";
        $now = Carbon::now();
        file_put_contents($this->logPath.'/freeform.log', $line($now->copy()->subHours(3)->toIso8601String(), 'ERROR', 'Inside period').str_repeat($line($now->copy()->addDays(2)->toIso8601String(), 'ERROR', 'Outside period'), 7));
        file_put_contents($this->logPath.'/freeform-integrations.log', $line($now->copy()->subHour()->toIso8601String(), 'WARNING', 'Integration warning'));
        file_put_contents($this->logPath.'/freeform-email.log', $line($now->copy()->subMinutes(30)->toIso8601String(), 'INFO', 'Email information'));
        $rows = $this->data($now->copy()->subDay(), $now);
        self::assertStringStartsWith('Integration warning', $rows[0]['message']);
        self::assertStringStartsWith('Inside period', $rows[1]['message']);
        self::assertCount(2, $rows);
        self::assertStringEndsWith('/admin/freeform/settings/integrations-log', $rows[0]['url']);
        self::assertStringEndsWith('/admin/freeform/settings/error-log', $rows[1]['url']);
        $this->settings->loggingStyle = 'none';
        self::assertSame([], $this->data($now->copy()->subDay(), $now));
    }

    private function data(Carbon $start, Carbon $end): array
    {
        return (new \ReflectionMethod(DigestService::class, 'getErrorData'))->invoke($this->digest, $start, $end);
    }
}
