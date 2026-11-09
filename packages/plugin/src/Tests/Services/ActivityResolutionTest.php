<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\ActivityController;
use Solspace\Freeform\Library\Activity\ActivityFeed;
use Solspace\Freeform\Library\Activity\ActivityInput;
use Solspace\Freeform\Library\Activity\ActivityQuery;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use yii\caching\ArrayCache;
use yii\db\Connection;
use yii\web\ForbiddenHttpException;

#[CoversClass(ActivityService::class)]
class ActivityResolutionTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYii;
    private Connection $db;
    private ActivityService $service;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYii = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, resolvedAt TEXT, event TEXT, category TEXT, level TEXT, formId INTEGER, submissionId INTEGER, dateCreated TEXT)')->execute();
        \Craft::$app = \Yii::$app = new class($this->db) {
            private ArrayCache $cache;

            public function __construct(private Connection $db)
            {
                $this->cache = new ArrayCache();
            }

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getCache(): ArrayCache
            {
                return $this->cache;
            }
        };
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $this->service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService'])->getMock();
        $this->service->method('getSettingsService')->willReturn($provider);
        $now = gmdate('Y-m-d H:i:s');
        $this->db->createCommand()->batchInsert('freeform_activity', ['id', 'event', 'category', 'level', 'formId', 'submissionId', 'dateCreated'], [
            [1, 'email-error', 'email', 'error', 1, 10, $now],
            [2, 'warning', 'system', 'warning', 1, 10, $now],
            [3, 'spam', 'spam', 'warning', 1, 10, $now],
            [4, 'validation', 'submissions', 'warning', 1, 10, $now],
            [5, 'error', 'system', 'error', 2, 10, $now],
            [6, 'error', 'system', 'error', 1, 20, $now],
            [7, 'error', 'system', 'error', 1, 10, $now],
            [8, 'error', 'system', 'error', 1, 10, gmdate('Y-m-d H:i:s', time() - 86400 * 31)],
        ])->execute();
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYii;
    }

    public function testSubmissionResolutionKeepsHistoryNewerFailuresAndOtherFormsOpen(): void
    {
        self::assertSame(4, $this->service->getErrorCount());
        self::assertSame(1, $this->service->getOperationalWarningCount());
        self::assertSame(2, $this->service->setResolved(1, 2, true, true));
        self::assertSame(3, $this->service->getErrorCount());
        self::assertSame(0, $this->service->getOperationalWarningCount());
        self::assertSame(8, (int) (new Query())->from('freeform_activity')->count());
        self::assertSame([1, 2], array_map('intval', (new Query())->select('id')->from('freeform_activity')->where(['not', ['resolvedAt' => null]])->column()));
        self::assertSame([7, 6, 5], array_map('intval', array_column($this->service->getOperationalEvents(new \DateTimeImmutable('-40 days'), new \DateTimeImmutable('+1 minute')), 'id')));
        self::assertSame(2, $this->service->setResolved(1, 2, false, true));
        self::assertSame(4, $this->service->getErrorCount());
        self::assertSame(1, $this->service->getOperationalWarningCount());
    }

    public function testEventResolutionIsIdempotentAndCannotResolveSpamOrValidation(): void
    {
        self::assertSame(1, $this->service->setResolved(1, 7, true));
        self::assertSame(0, $this->service->setResolved(1, 7, true));
        self::assertSame(0, $this->service->setResolved(3, 7, true));
        self::assertSame(0, $this->service->setResolved(4, 7, true));
        self::assertSame(1, $this->service->getOperationalWarningCount());
        self::assertSame(1, $this->service->setResolved(1, 7, false));
        self::assertSame(4, $this->service->getErrorCount());
    }

    public function testGroupedResolvedStateRequiresAllRetainedIssuesToBeResolved(): void
    {
        $query = (new Query())->from('freeform_activity')->where(['>=', 'dateCreated', gmdate('Y-m-d H:i:s', time() - 86400 * 30)])->andWhere(['formId' => 1, 'submissionId' => 10]);
        $this->service->setResolved(1, 2, true, true);
        $row = ActivityFeed::page($query, gmdate('Y-m-d H:i:s', time() - 86400 * 30))['rows'][0];
        self::assertFalse($row['isResolved']);
        self::assertSame(1, $row['chainOpenIssues']);
        $this->service->setResolved(1, 7, true, true);
        $row = ActivityFeed::page($query, gmdate('Y-m-d H:i:s', time() - 86400 * 30))['rows'][0];
        self::assertTrue($row['isResolved']);
        self::assertSame(0, $row['chainOpenIssues']);
    }

    public function testResolutionFiltersMatchTheSameIssuesAsDashboardCounts(): void
    {
        $this->service->setResolved(1, 2, true, true);
        $filters = ActivityInput::filters(['resolution' => 'open']);
        $cutoff = gmdate('Y-m-d H:i:s', time() - 86400 * 30);
        $open = ActivityQuery::filtered($filters, $cutoff)->orderBy(['id' => \SORT_DESC])->all();
        self::assertSame([7, 6, 5], array_map('intval', array_column($open, 'id')));
        $filters['resolution'] = 'resolved';
        self::assertSame(2, (int) ActivityQuery::filtered($filters, $cutoff)->count());
        $this->service->setResolved(1, 7, true, true);
        $this->db->createCommand()->insert('freeform_activity', ['id' => 9, 'event' => 'warning', 'category' => 'system', 'level' => 'warning', 'formId' => 1, 'submissionId' => 10, 'dateCreated' => gmdate('Y-m-d H:i:s')])->execute();
        $row = ActivityFeed::page((new Query())->from('freeform_activity')->where(['formId' => 1, 'submissionId' => 10])->andWhere(['>=', 'dateCreated', $cutoff]), $cutoff)['rows'][0];
        self::assertSame(9, (int) $row['id']);
        self::assertFalse($row['isResolved']);
    }

    public function testResolvingRequiresActivityManagementPermission(): void
    {
        \Craft::$app = new class {
            public object $request;

            public function __construct()
            {
                $this->request = new class {
                    public function getIsConsoleRequest(): bool
                    {
                        return true;
                    }
                };
            }

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }

                    public function checkPermission($name): bool
                    {
                        return false;
                    }
                };
            }
        };
        $controller = $this->getMockBuilder(ActivityController::class)->disableOriginalConstructor()->onlyMethods(['requirePostRequest'])->getMock();
        $controller->expects(self::once())->method('requirePostRequest');
        $this->expectException(ForbiddenHttpException::class);
        PermissionHelper::asAuthenticatedUser(static fn () => $controller->actionResolve(), []);
    }

    public function testStaleOrInvalidTargetCannotAcknowledgeNewerEvents(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->setResolved(7, 2, true, true);
    }
}
