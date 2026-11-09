<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use yii\caching\ArrayCache;
use yii\db\Connection;

#[CoversClass(ActivityService::class)]
class ActivityAlertCountTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Connection $db;
    private ActivityService $service;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, resolvedAt TEXT, category TEXT, level TEXT, dateCreated TEXT)')->execute();
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
        $settings->activityRetentionDays = 30;
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $this->service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService'])->getMock();
        $this->service->method('getSettingsService')->willReturn($provider);
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testWarningsExcludeSpamValidationOtherSeveritiesAndExpiredEvents(): void
    {
        $now = gmdate('Y-m-d H:i:s');
        $old = gmdate('Y-m-d H:i:s', time() - 86400 * 31);
        $this->db->createCommand()->batchInsert('freeform_activity', ['category', 'level', 'dateCreated'], [
            ['system', 'warning', $now], ['system', 'warning', $now],
            ['spam', 'warning', $now], ['submissions', 'warning', $now],
            ['system', 'warning', $old], ['system', 'error', $now],
            ['email', 'error', $now], ['integrations', 'error', $old],
        ])->execute();
        self::assertSame(2, $this->service->getOperationalWarningCount());
        self::assertSame(2, $this->service->getErrorCount());
        $this->db->createCommand()->delete('freeform_activity')->execute();
        $this->service->invalidateErrorCount();
        self::assertSame(0, $this->service->getOperationalWarningCount());
        self::assertSame(0, $this->service->getErrorCount());
    }

    public function testUnavailableActivityTableDoesNotBreakDashboardAlerts(): void
    {
        $this->db->createCommand('DROP TABLE freeform_activity')->execute();
        self::assertSame(0, $this->service->getOperationalWarningCount());
        self::assertSame(0, $this->service->getErrorCount());
    }
}
