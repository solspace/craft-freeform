<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityFeed;
use Solspace\Freeform\Library\Activity\ActivityTable;
use yii\db\Connection;

#[CoversNothing]
class ActivityFeedTest extends TestCase
{
    private const CUTOFF = '2026-10-01 00:00:00';
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Connection $db;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
        $this->db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, event TEXT, category TEXT, level TEXT, formId INTEGER, submissionId INTEGER, metadata TEXT, dateCreated TEXT)')->execute();
        \Craft::$app = \Yii::$app = new class($this->db) {
            public function __construct(private Connection $db) {}

            public function getDb(): Connection
            {
                return $this->db;
            }
        };
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testChainShowsWorstRetainedOutcomeEvenAfterASuccessfulRetry(): void
    {
        $this->add(1, 'success', 12, 42);
        $this->add(2, 'error', 12, 42);
        $this->add(3, 'success', 12, 42);
        $this->add(4, 'error', 12, 42, '2026-09-01 00:00:00');
        $page = ActivityFeed::page($this->query(), self::CUTOFF);
        self::assertCount(1, $page['rows']);
        $row = $page['rows'][0];
        self::assertSame(2, (int) $row['id']);
        self::assertSame(3, $row['cursor']);
        self::assertSame(3, $row['chainCount']);
        self::assertSame('error', $row['level']);
        self::assertTrue($row['isChain']);
        self::assertFalse($page['hasMore']);
    }

    public function testStandaloneEventsStaySeparateAndFormBoundariesAreRespected(): void
    {
        $this->add(1, 'info', 12, null);
        $this->add(2, 'info', 12, null);
        $this->add(3, 'success', 12, 42);
        $this->add(4, 'warning', 13, 42);
        $rows = ActivityFeed::page($this->query(), self::CUTOFF)['rows'];
        self::assertCount(4, $rows);
        self::assertSame([4, 3, 2, 1], array_column($rows, 'cursor'));
        self::assertNotSame($rows[0]['chainKey'], $rows[1]['chainKey']);
        self::assertFalse($rows[2]['isChain']);
        self::assertFalse($rows[3]['isChain']);
    }

    public function testFilteringMatchesAChainButDoesNotHideItsRecordedProblems(): void
    {
        $this->add(1, 'success', 12, 42);
        $this->add(2, 'error', 12, 42);
        $this->add(3, 'warning', 12, 43);
        $page = ActivityFeed::page($this->query()->andWhere(['level' => 'success']), self::CUTOFF);
        self::assertCount(1, $page['rows']);
        self::assertSame('error', $page['rows'][0]['level']);
        self::assertSame(2, $page['rows'][0]['chainCount']);
        self::assertSame(1, $page['rows'][0]['cursor']);
    }

    public function testOlderPagesDoNotRepeatChainsAndCursorUsesLatestEventRatherThanHeadline(): void
    {
        for ($i = 1; $i <= 60; ++$i) {
            $this->add($i, 'error', 12, $i);
            $this->add(100 + $i, 'success', 12, $i);
        }
        $first = ActivityFeed::page($this->query(), self::CUTOFF);
        self::assertCount(50, $first['rows']);
        self::assertTrue($first['hasMore']);
        self::assertSame(60, (int) $first['rows'][0]['id']);
        self::assertSame(160, $first['rows'][0]['cursor']);
        $second = ActivityFeed::page($this->query(), self::CUTOFF, $first['rows'][49]['cursor']);
        self::assertCount(10, $second['rows']);
        self::assertFalse($second['hasMore']);
        self::assertSame([], array_intersect(array_column($first['rows'], 'chainKey'), array_column($second['rows'], 'chainKey')));
    }

    public function testIndividualViewKeepsTheOriginalEventOrder(): void
    {
        $this->add(1, 'error', 12, 42);
        $this->add(2, 'success', 12, 42);
        $page = ActivityFeed::page($this->query(), self::CUTOFF, 0, false);
        self::assertSame([2, 1], array_column($page['rows'], 'cursor'));
        self::assertSame(['event:2', 'event:1'], array_column($page['rows'], 'chainKey'));
        self::assertCount(1, ActivityFeed::page($this->query(), self::CUTOFF, 2, false)['rows']);
        self::assertSame([], ActivityFeed::page($this->query()->andWhere(['level' => 'warning']), self::CUTOFF)['rows']);
    }

    public function testTotalsAndPreviousPagesUseGroupCursorsRatherThanHeadlineIds(): void
    {
        for ($i = 1; $i <= 60; ++$i) {
            $this->add($i, 'error', 12, $i);
            $this->add(100 + $i, 'success', 12, $i);
        }
        $first = ActivityFeed::page($this->query(), self::CUTOFF);
        $second = ActivityFeed::page($this->query(), self::CUTOFF, $first['nextCursor']);
        $previous = ActivityFeed::page($this->query(), self::CUTOFF, 0, true, $second['previousCursor']);
        self::assertSame(60, $first['total']);
        self::assertSame(60, $second['total']);
        self::assertSame(array_column($first['rows'], 'chainKey'), array_column($previous['rows'], 'chainKey'));
        self::assertSame(160, $previous['previousCursor']);
        self::assertSame(111, $previous['nextCursor']);
    }

    public function testIndividualPreviousPagesAndFilteredTotalsRemainAccurate(): void
    {
        for ($i = 1; $i <= 120; ++$i) {
            $this->add($i, $i % 2 ? 'success' : 'error', 12, 42);
        }
        $first = ActivityFeed::page($this->query(), self::CUTOFF, 0, false);
        $second = ActivityFeed::page($this->query(), self::CUTOFF, $first['nextCursor'], false);
        $previous = ActivityFeed::page($this->query(), self::CUTOFF, 0, false, $second['previousCursor']);
        self::assertSame(120, $first['total']);
        self::assertSame(array_column($first['rows'], 'id'), array_column($previous['rows'], 'id'));
        self::assertSame(60, ActivityFeed::page($this->query()->andWhere(['level' => 'error']), self::CUTOFF, 0, false)['total']);
        self::assertSame(1, ActivityFeed::page($this->query()->andWhere(['level' => 'error']), self::CUTOFF)['total']);
        self::assertSame(0, ActivityFeed::page($this->query()->andWhere(['level' => 'warning']), self::CUTOFF)['total']);
    }

    private function query(): Query
    {
        return (new Query())->from(ActivityTable::TABLE)->where(['>=', 'dateCreated', self::CUTOFF]);
    }

    private function add(int $id, string $level, int $formId, ?int $submissionId, string $date = '2026-10-28 12:00:00'): void
    {
        $this->db->createCommand()->insert(ActivityTable::TABLE, ['id' => $id, 'event' => 'submission', 'category' => 'submissions', 'level' => $level, 'formId' => $formId, 'submissionId' => $submissionId, 'dateCreated' => $date, 'metadata' => '{}'])->execute();
    }
}
