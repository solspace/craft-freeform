<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use yii\db\Connection;

#[CoversNothing]
class ActivityCleanupTest extends TestCase
{
    private mixed $craftApp;
    private mixed $yiiApp;
    private Connection $db;
    private ActivityService $service;

    protected function setUp(): void
    {
        $this->craftApp = \Craft::$app;
        $this->yiiApp = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, dateCreated TEXT, level TEXT)')->execute();
        $app = new class($this->db) {
            public function __construct(private Connection $db) {}

            public function getDb(): Connection
            {
                return $this->db;
            }
        };
        \Craft::$app = $app;
        \Yii::$app = $app;
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $settings->activityRetentionDays = 30;
        $settings->activityMaxRows = 1000;
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $this->service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService'])->getMock();
        $this->service->method('getSettingsService')->willReturn($provider);
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->craftApp;
        \Yii::$app = $this->yiiApp;
    }

    public function testPartialExpiryBatchStillContinuesOverflowCleanup(): void
    {
        $this->seed(250, gmdate('Y-m-d H:i:s', time() - 86400 * 45));
        $this->seed(2000, gmdate('Y-m-d H:i:s'));
        self::assertSame(750, $this->service->purge(2));
        self::assertTrue($this->service->shouldContinueCleanup());
        self::assertSame(500, $this->service->purge(2));
        self::assertFalse($this->service->shouldContinueCleanup());
        self::assertSame(1000, (int) $this->db->createCommand('SELECT COUNT(*) FROM freeform_activity')->queryScalar());
    }

    public function testExpiredRecordsAreRemovedEvenWhenTheirIdsAreNewer(): void
    {
        $this->seed(10, gmdate('Y-m-d H:i:s'));
        $this->seed(4, gmdate('Y-m-d H:i:s', time() - 86400 * 45));
        self::assertSame(4, $this->service->purge(1));
        self::assertSame(range(1, 10), array_map('intval', $this->db->createCommand('SELECT id FROM freeform_activity ORDER BY id')->queryColumn()));
    }

    public function testClearKeepsNewerEventsAndIsBounded(): void
    {
        $this->seed(700, gmdate('Y-m-d H:i:s'));
        self::assertSame(500, $this->service->clearBatch(600));
        self::assertSame(100, $this->service->clearBatch(600));
        self::assertSame(0, $this->service->clearBatch(600));
        self::assertSame(100, (int) $this->db->createCommand('SELECT COUNT(*) FROM freeform_activity')->queryScalar());
        self::assertSame(601, (int) $this->db->createCommand('SELECT MIN(id) FROM freeform_activity')->queryScalar());
    }

    private function seed(int $count, string $date): void
    {
        $this->db->createCommand()->batchInsert('freeform_activity', ['dateCreated', 'level'], array_fill(0, $count, [$date, 'info']))->execute();
    }
}
