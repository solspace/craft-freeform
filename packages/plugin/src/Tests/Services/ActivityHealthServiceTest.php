<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityInput;
use Solspace\Freeform\Library\Activity\ActivityQuery;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityHealthService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\SettingsService;
use yii\db\Connection;
use yii\web\ForbiddenHttpException;

#[CoversClass(ActivityHealthService::class)]
class ActivityHealthServiceTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYii;
    private Settings $settings;
    private Connection $db;
    private ActivityHealthService $service;
    private string $path;
    private bool $allowAdminEdit = true;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYii = \Yii::$app;
        $this->path = sys_get_temp_dir().'/freeform-health-'.bin2hex(random_bytes(6));
        mkdir($this->path);
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, event TEXT, category TEXT, level TEXT, formId INTEGER, submissionId INTEGER, metadata TEXT, dateCreated TEXT, resolvedAt TEXT)')->execute();
        $this->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($this->settings);
        $provider->method('isAllowAdminEdit')->willReturnCallback(fn () => $this->allowAdminEdit);
        $this->service = $this->getMockBuilder(ActivityHealthService::class)->onlyMethods(['getSettingsService'])->getMock();
        $this->service->method('getSettingsService')->willReturn($provider);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->with('logger')->willReturn(new LoggerService());
        \Craft::$app = \Yii::$app = new class($this->db, $plugin, $this->path) {
            public array $loadedModules;
            public object $request;
            public object $path;

            public function __construct(private Connection $db, $plugin, string $path)
            {
                $this->loadedModules = [Freeform::class => $plugin];
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
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

            public function getRequest(): object
            {
                return $this->request;
            }

            public function getIsInitialized(): bool
            {
                return false;
            }

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }
                };
            }

            public function getConfig(): object
            {
                return new class {
                    public function getGeneral(): object
                    {
                        return (object) ['cpTrigger' => 'admin', 'omitScriptNameInUrls' => true, 'baseCpUrl' => 'https://craft5.test', 'pathParam' => 'p', 'securityKey' => 'test'];
                    }
                };
            }
        };
    }

    protected function tearDown(): void
    {
        $this->db->close();
        foreach (glob($this->path.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->path);
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYii;
    }

    public function testCountsUseTheSelectedWindowAndKeepResolvedActivityInOptionalTotals(): void
    {
        $this->seed('email-error', 'email', 'error', '-1 hour');
        $this->seed('warning', 'system', 'warning', '-2 hours');
        $this->seed('spam', 'spam', 'warning', '-3 hours');
        $this->seed('validation', 'submissions', 'warning', '-4 hours');
        $this->seed('submission', 'submissions', 'success', '-5 hours');
        $this->seed('email-error', 'email', 'error', '-6 hours', true);
        $this->seed('error', 'system', 'error', '-10 days');
        $health = $this->service->snapshot(7, ['submission', 'email-error', 'validation']);
        self::assertTrue($health['available']);
        self::assertSame(1, $health['errors']);
        self::assertSame(1, $health['warnings']);
        self::assertSame(2, $health['breakdown'][2]['count']);
        self::assertSame(6, $health['recorded']);
        self::assertSame($health['recorded'], array_sum(array_column($health['trend'], 'count')));
        self::assertLessThanOrEqual(28, \count($this->service->snapshot(365, [])['trend']));
        self::assertSame(['submission', 'validation', 'email-error'], array_column($health['breakdown'], 'event'));
        self::assertCount(2, $health['recent']);
        self::assertStringContainsString('days=7', $health['errorUrl']);
        self::assertStringContainsString('resolution=open', $health['warningUrl']);
        self::assertStringNotContainsString('SECRET', json_encode($health));
        $withoutBreakdown = $this->service->snapshot(30, []);
        self::assertTrue($withoutBreakdown['available']);
        self::assertSame([], $withoutBreakdown['breakdown']);
        self::assertSame(2, $withoutBreakdown['errors']);
    }

    public function testNoticeOnlyActivityDoesNotRaiseHealthAlertsOrRecentIssues(): void
    {
        $this->seed('spam', 'spam', 'notice', '-1 hour');
        $this->seed('validation', 'submissions', 'notice', '-2 hours');
        $health = $this->service->snapshot(7, ['spam', 'validation']);
        self::assertTrue($health['available']);
        self::assertSame(0, $health['errors']);
        self::assertSame(0, $health['warnings']);
        self::assertSame([], $health['recent']);
        self::assertSame(2, $health['recorded']);
        self::assertSame([1, 1], array_column($health['breakdown'], 'count'));
    }

    public function testRecentIssuesProvideABoundedNewestFirstPoolForLargerWidgets(): void
    {
        for ($hour = 1; $hour <= 25; ++$hour) {
            $this->seed('error', 'system', 'error', "-{$hour} hours");
        }
        $this->seed('spam', 'spam', 'warning', '-1 minute');
        $this->seed('error', 'system', 'error', '-2 minutes', true);
        $recent = $this->service->snapshot(7, [])['recent'];
        self::assertCount(20, $recent);
        self::assertStringContainsString('eventId=1', $recent[0]['url']);
        self::assertStringContainsString('eventId=20', $recent[19]['url']);
        self::assertSame([], $this->service->snapshot(7, [], false)['recent']);
    }

    public function testRetentionLimitsHistoryAndDisabledEventTypesAreNotShownAsZeroActivity(): void
    {
        $this->settings->activityRetentionDays = 2;
        $this->settings->activityMode = 'minimal';
        $this->seed('error', 'system', 'error', '-3 days');
        $result = $this->service->snapshot(90, ['submission'], false);
        self::assertSame(2, $result['days']);
        self::assertSame(90, $result['requestedDays']);
        self::assertSame(0, $result['errors']);
        self::assertTrue($result['available']);
        self::assertSame(0, $result['recorded']);
        self::assertSame(0, array_sum(array_column($result['trend'], 'count')));
        self::assertFalse($result['breakdown'][0]['recording']);
        self::assertSame([], $result['recent']);
        $this->db->createCommand('DROP TABLE freeform_activity')->execute();
        self::assertFalse($this->service->snapshot(7, [])['available']);
    }

    public function testClassicUsesFileDatesAndNoneDoesNotReportStaleFileErrors(): void
    {
        $this->settings->loggingStyle = 'classic';
        $line = static fn ($date, $level) => '['.$date."] health.{$level}: Test message {} {}\n";
        file_put_contents($this->path.'/freeform.log', $line(gmdate('c', time() - 3600), 'ERROR').$line(gmdate('c', time() - 86400 * 10), 'ERROR'));
        file_put_contents($this->path.'/freeform-email.log', $line(gmdate('c', time() - 3600), 'WARNING'));
        $result = $this->service->snapshot(7, ['submission']);
        self::assertSame(1, $result['errors']);
        self::assertSame(1, $result['warnings']);
        self::assertSame([], $result['breakdown']);
        self::assertCount(3, $result['links']);
        $this->settings->loggingStyle = 'none';
        self::assertSame(0, $this->service->snapshot(7, [])['errors']);
    }

    public function testActivityLinksApplyBothTheRequestedWindowAndRetention(): void
    {
        $this->seed('error', 'system', 'error', '-1 hour');
        $this->seed('error', 'system', 'error', '-3 days');
        $this->seed('error', 'system', 'error', '-10 days');
        $filters = ActivityInput::filters(['days' => '7', 'resolution' => 'open']);
        self::assertSame(2, (int) ActivityQuery::filtered($filters, '1970-01-01')->count());
        self::assertSame(1, (int) ActivityQuery::filtered($filters, gmdate('Y-m-d H:i:s', time() - 86400 * 2))->count());
    }

    public function testHeaderNavigationUsesTheSelectedLogAndActualRetention(): void
    {
        $this->settings->activityRetentionDays = 2;
        $navigation = $this->service->navigation(90);
        self::assertSame(2, $navigation['days']);
        self::assertSame('All forms', $navigation['scope']);
        self::assertStringContainsString('days=2', $navigation['links'][0]['url']);
        self::assertSame('Open Activity Log', $navigation['links'][0]['label']);
        $this->settings->loggingStyle = 'classic';
        $navigation = $this->service->navigation(7);
        self::assertSame(7, $navigation['days']);
        self::assertCount(3, $navigation['links']);
        self::assertStringContainsString('settings/email-log', $navigation['links'][2]['url']);
        $this->settings->loggingStyle = 'none';
        self::assertSame([], $this->service->navigation(7)['links']);
    }

    public function testActivityOnlyPermissionCannotReadClassicFiles(): void
    {
        $this->settings->loggingStyle = 'classic';
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(fn () => $this->service->snapshot(7, []), [strtolower(Freeform::PERMISSION_ACTIVITY_ACCESS)]);
    }

    #[TestWith([true, true, true])]
    #[TestWith([true, false, false])]
    #[TestWith([false, true, false])]
    #[TestWith([false, false, false])]
    public function testDisabledLoggingLinksToSettingsOnlyWhenTheUserCanEnableIt(bool $settingsAccess, bool $allowAdminEdit, bool $canEnableLogging): void
    {
        $this->settings->loggingStyle = 'none';
        $this->allowAdminEdit = $allowAdminEdit;
        $permissions = [strtolower($settingsAccess ? Freeform::PERMISSION_SETTINGS_ACCESS : Freeform::PERMISSION_ACTIVITY_ACCESS)];
        $health = PermissionHelper::asAuthenticatedUser(fn () => $this->service->snapshot(7, []), $permissions);

        if ($canEnableLogging) {
            self::assertStringContainsString('/admin/freeform/settings/activity', $health['settingsUrl']);
        } else {
            self::assertNull($health['settingsUrl']);
        }
    }

    public function testActivityDataRequiresExplicitLogAccess(): void
    {
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(fn () => $this->service->snapshot(7, []), []);
    }

    private function seed(string $event, string $category, string $level, string $when, bool $resolved = false): void
    {
        $this->db->createCommand()->insert('freeform_activity', ['event' => $event, 'category' => $category, 'level' => $level, 'dateCreated' => (new \DateTimeImmutable($when, new \DateTimeZone('UTC')))->format('Y-m-d H:i:s'), 'metadata' => '{"message":"SECRET"}', 'resolvedAt' => $resolved ? gmdate('Y-m-d H:i:s') : null])->execute();
    }
}
