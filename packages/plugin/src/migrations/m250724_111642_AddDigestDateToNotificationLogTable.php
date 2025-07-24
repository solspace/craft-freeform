<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use yii\db\Expression;

class m250724_111642_AddDigestDateToNotificationLogTable extends Migration
{
    public function safeUp(): bool
    {
        $column = 'digestDate';
        $table = '{{%freeform_notification_log}}';
        $indexName = 'freeform_notification_log_type_digestDate_unique_idx';

        // Determine correct casting expression based on DB driver
        $driver = \Craft::$app->getDb()->getDriverName();
        $castDateExpr = 'pgsql' === $driver
            ? 'CAST("dateCreated" AS DATE)'
            : 'CAST(`dateCreated` AS DATE)';
        $alias = 'pgsql' === $driver ? '"digestDate"' : 'digestDate';

        // Add `digestDate` column if it doesn't exist
        if (!$this->db->getTableSchema($table)->getColumn($column)) {
            $this->addColumn($table, $column, $this->date()->after('type')->null()->defaultValue(null));
        }

        // Populate digestDate from dateCreated if null
        $this->update($table, [
            $column => new Expression($castDateExpr),
        ], [
            $column => null,
        ]);

        // Deduplicate rows: keep only latest ID per (type, digestDate)
        $rows = (new Query())
            ->select([
                'id',
                'type',
                new Expression("{$castDateExpr} AS {$alias}"),
            ])
            ->from($table)
            ->orderBy(['id' => \SORT_DESC])
            ->all()
        ;

        $seen = [];
        foreach ($rows as $row) {
            if (!isset($row['digestDate'])) {
                \Craft::warning('Skipping row with missing digestDate: '.json_encode($row), __METHOD__);

                continue;
            }

            $key = $row['type'].'|'.$row['digestDate'];
            if (isset($seen[$key])) {
                \Craft::$app->getDb()->createCommand()
                    ->delete($table, ['id' => $row['id']])
                    ->execute()
                ;
            } else {
                $seen[$key] = true;
            }
        }

        // Make digestDate NOT NULL
        $this->alterColumn($table, $column, $this->date()->notNull());

        // Add unique index on (type, digestDate) if it doesn't already exist
        $existingIndexes = \Craft::$app->db->schema->getTableIndexes($table);
        $indexNames = array_map(fn ($index) => $index->name ?? null, $existingIndexes);

        if (!\in_array($indexName, $indexNames, true)) {
            $this->createIndex(
                $indexName,
                $table,
                ['type', $column],
                true // unique
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $column = 'digestDate';
        $table = '{{%freeform_notification_log}}';
        $indexName = 'freeform_notification_log_type_digestDate_unique_idx';

        // Drop the unique index if it exists
        $existingIndexes = \Craft::$app->db->schema->getTableIndexes($table);
        $indexNames = array_map(fn ($index) => $index->name ?? null, $existingIndexes);

        if (\in_array($indexName, $indexNames, true)) {
            $this->dropIndex($indexName, $table);
        }

        // Drop the column if it exists
        if ($this->db->getTableSchema($table)->getColumn($column)) {
            $this->dropColumn($table, $column);
        }

        return true;
    }
}
