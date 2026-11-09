<?php

namespace Solspace\Freeform\Tests\Migrations;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityExport;
use Solspace\Freeform\Library\Activity\ActivityInput;
use Solspace\Freeform\Library\Activity\ActivityQuery;
use Solspace\Freeform\migrations\m261106_220000_ClassifyActivityNotices;
use yii\db\Connection;

#[CoversClass(m261106_220000_ClassifyActivityNotices::class)]
class ClassifyActivityNoticesTest extends TestCase
{
    public function testExistingNoticesAreReclassifiedAndRemainFilterableAndExportable(): void
    {
        $previousApp = \Craft::$app;
        $previousYii = \Yii::$app;
        $db = new class(['dsn' => 'sqlite::memory:']) extends Connection {
            public function tableExists(string $table): bool
            {
                return null !== $this->getTableSchema($table, true);
            }
        };
        \Craft::$app = \Yii::$app = new class($db) {
            public function __construct(private Connection $db) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function get(string $id, bool $throwException = true): mixed
            {
                return null;
            }
        };
        ob_start();

        try {
            $migration = new m261106_220000_ClassifyActivityNotices(['db' => $db]);
            self::assertTrue($migration->safeUp()); // Safe before Activity has been installed.
            $db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, event TEXT, level TEXT, category TEXT, dateCreated TEXT, dateUpdated TEXT, resolvedAt TEXT, metadata TEXT, formId INTEGER, submissionId INTEGER)')->execute();
            $db->createCommand()->batchInsert('freeform_activity', ['id', 'event', 'level', 'category', 'dateCreated', 'dateUpdated'], [
                [1, 'spam', 'warning', 'spam', '2026-11-06 08:00:00', '2026-11-06 08:00:00'],
                [2, 'validation', 'warning', 'submissions', '2026-11-06 08:00:00', '2026-11-06 08:00:00'],
                [3, 'warning', 'warning', 'system', '2026-11-06 08:00:00', '2026-11-06 08:00:00'],
                [4, 'email-error', 'error', 'email', '2026-11-06 08:00:00', '2026-11-06 08:00:00'],
            ])->execute();
            self::assertTrue($migration->safeUp());
            self::assertTrue($migration->safeUp()); // Re-running leaves the same history.
            self::assertSame(['notice', 'notice', 'warning', 'error'], (new Query())->select('level')->from('freeform_activity')->orderBy('id')->column());
            self::assertSame(['2026-11-06 08:00:00'], (new Query())->select('dateUpdated')->from('freeform_activity')->distinct()->column());
            $notices = ActivityQuery::filtered(ActivityInput::filters(['level' => 'notice']), '2026-11-01')->all();
            self::assertCount(2, $notices);
            self::assertSame(1, (int) ActivityQuery::filtered(ActivityInput::filters(['level' => 'warning']), '2026-11-01')->count());
            self::assertSame(2, (int) ActivityQuery::filtered(ActivityInput::filters(['resolution' => 'open']), '2026-11-01')->count());
            $stream = fopen('php://temp', 'w+');
            self::assertSame(2, ActivityExport::write($stream, $notices, 'json'));
            rewind($stream);
            self::assertSame(['notice', 'notice'], array_column(json_decode(stream_get_contents($stream), true), 'level'));
            fclose($stream);
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYii;
        }
    }
}
