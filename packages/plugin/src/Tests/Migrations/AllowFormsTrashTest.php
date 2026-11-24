<?php

namespace Solspace\Freeform\Tests\Migrations;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\migrations\m261123_225500_AllowFormsTrash;
use Solspace\Freeform\Records\FormRecord;
use yii\db\Connection;
use yii\db\Query;
use yii\db\sqlite\QueryBuilder;
use yii\db\sqlite\Schema;

#[CoversClass(m261123_225500_AllowFormsTrash::class)]
class AllowFormsTrashTest extends TestCase
{
    #[TestWith([false, false])]
    #[TestWith([true, false])]
    #[TestWith([true, true])]
    public function testUpgradePreservesTrashDatesAndCanBeRetried(bool $hasLegacyColumn, bool $hasFinalColumns): void
    {
        $previousApp = \Yii::$app;
        $db = new class(['dsn' => 'sqlite::memory:', 'schemaCache' => null, 'schemaMap' => ['sqlite' => TrashMigrationTestSchema::class]]) extends Connection {
            public function columnExists(string $table, string $column): bool
            {
                return null !== $this->getTableSchema($table, true)?->getColumn($column);
            }
        };
        ob_start();

        try {
            $columns = ['id' => 'integer PRIMARY KEY'];
            if ($hasLegacyColumn) {
                $columns['dateMergeTrashed'] = 'datetime';
            }
            if ($hasFinalColumns) {
                $columns['dateTrashed'] = 'datetime';
                $columns['trashedFromMerge'] = 'boolean NOT NULL DEFAULT false';
            }
            $db->createCommand()->createTable(FormRecord::TABLE, $columns)->execute();

            $mergeDate = '2026-11-23 15:20:00';
            $manualDate = '2026-11-24 15:20:00';
            $legacyRow = $hasLegacyColumn ? ['dateMergeTrashed' => $mergeDate] : [];
            $manualRow = $hasFinalColumns ? ['dateTrashed' => $manualDate] : [];
            $db->createCommand()->insert(FormRecord::TABLE, ['id' => 1] + $legacyRow)->execute();
            $db->createCommand()->insert(FormRecord::TABLE, ['id' => 2] + $manualRow)->execute();

            $migration = new m261123_225500_AllowFormsTrash(['db' => $db]);
            self::assertTrue($migration->safeUp());
            self::assertTrue($migration->safeUp());
            self::assertFalse($db->columnExists(FormRecord::TABLE, 'dateMergeTrashed'));
            $rows = (new Query())->from(FormRecord::TABLE)->orderBy('id')->all($db);
            self::assertSame($hasLegacyColumn ? $mergeDate : null, $rows[0]['dateTrashed']);
            self::assertSame($hasLegacyColumn, (bool) $rows[0]['trashedFromMerge']);
            self::assertSame($hasFinalColumns ? $manualDate : null, $rows[1]['dateTrashed']);
            self::assertFalse((bool) $rows[1]['trashedFromMerge']);
        } finally {
            ob_end_clean();
            $db->close();
            \Yii::$app = $previousApp;
        }
    }
}

class TrashMigrationTestSchema extends Schema
{
    public function createQueryBuilder(): QueryBuilder
    {
        return new class($this->db) extends QueryBuilder {
            public function dropColumn($table, $column): string
            {
                // Yii's SQLite builder predates SQLite's native DROP COLUMN support.
                return 'ALTER TABLE '.$this->db->quoteTableName($table).' DROP COLUMN '.$this->db->quoteColumnName($column);
            }
        };
    }
}
