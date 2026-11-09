<?php

namespace Solspace\Freeform\Tests\Migrations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261028_120000_AddActivityLog;
use Solspace\Freeform\migrations\m261106_190000_AddActivityResolution;
use Solspace\Freeform\migrations\m261106_220000_ClassifyActivityNotices;
use yii\db\Connection;

#[CoversNothing]
class ActivitySchemaUpgradeTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testActivityMigrationsPreserveHistoryAndCanBeRunAgain(bool $existingTable): void
    {
        $previousApp = \Craft::$app;
        $previousYii = \Yii::$app;
        $db = new class(['dsn' => 'sqlite::memory:']) extends Connection {
            public function tableExists(string $table): bool
            {
                return null !== $this->getTableSchema($table, true);
            }
        };
        $config = new class {
            public ?string $mode = null;

            public function get(string $path): ?string
            {
                return $this->mode;
            }

            public function set(string $path, string $value, string $message): void
            {
                $this->mode = $value;
            }
        };
        \Craft::$app = \Yii::$app = new class($db, $config) {
            public function __construct(private Connection $db, private object $config) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getProjectConfig(): object
            {
                return $this->config;
            }

            public function get(string $id, bool $throwException = true): mixed
            {
                return null;
            }
        };
        ob_start();

        try {
            if ($existingTable) {
                $db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, event TEXT, category TEXT, level TEXT, metadata TEXT, dateCreated TEXT, dateUpdated TEXT)')->execute();
                $db->createCommand()->insert('freeform_activity', [
                    'id' => 7,
                    'event' => 'spam',
                    'category' => 'spam',
                    'level' => 'warning',
                    'metadata' => '{"reason":"existing history"}',
                    'dateCreated' => '2026-11-01 12:00:00',
                    'dateUpdated' => '2026-11-01 12:00:00',
                ])->execute();
            }

            foreach ([m261028_120000_AddActivityLog::class, m261106_190000_AddActivityResolution::class, m261106_220000_ClassifyActivityNotices::class] as $migrationClass) {
                $migration = new $migrationClass(['db' => $db]);
                self::assertTrue($migration->safeUp());
                self::assertTrue($migration->safeUp());
            }

            self::assertSame('minimal', $config->mode);
            self::assertNotNull($db->getTableSchema('freeform_activity', true)->getColumn('resolvedAt'));
            $indexes = $db->createCommand('PRAGMA index_list(freeform_activity)')->queryAll();
            $indexColumns = array_map(static fn (array $index): array => array_column($db->createCommand('PRAGMA index_info('.$db->quoteTableName($index['name']).')')->queryAll(), 'name'), $indexes);
            self::assertContains(['resolvedAt', 'level', 'dateCreated'], $indexColumns);
            $rows = $db->createCommand('SELECT * FROM freeform_activity')->queryAll();
            self::assertCount($existingTable ? 1 : 0, $rows);
            if ($existingTable) {
                self::assertSame(7, (int) $rows[0]['id']);
                self::assertSame('notice', $rows[0]['level']);
                self::assertSame('{"reason":"existing history"}', $rows[0]['metadata']);
                self::assertSame('2026-11-01 12:00:00', $rows[0]['dateUpdated']);
                self::assertNull($rows[0]['resolvedAt']);
            } else {
                self::assertCount(7, $indexes);
            }
        } finally {
            ob_end_clean();
            $db->close();
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYii;
        }
    }
}
