<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use yii\db\Expression;

class m250724_111642_AddDigestDateToNotificationLogTable extends Migration
{
    public function safeUp(): bool
    {
        $column = 'digestDate';
        $table = '{{%freeform_notification_log}}';
        $indexName = 'freeform_notification_log_type_digestDate_unique_idx';

        // Add `digestDate` column if it doesn't exist
        if (!$this->db->getTableSchema($table)->getColumn($column)) {
            $this->addColumn($table, $column, $this->date()->after('type')->null()->defaultValue(null));
        }

        // Populate digestDate from dateCreated if null
        $this->update($table, [
            $column => new Expression('DATE(`dateCreated`)'),
        ], [
            $column => null,
        ]);

        // Make digestDate NOT NULL if all rows have it set
        $this->alterColumn($table, $column, $this->date()->notNull());

        // Manually extract index names from the returned index metadata
        $existingIndexes = \Craft::$app->db->schema->getTableIndexes($table);
        $indexNames = array_map(fn ($index) => $index->name ?? null, $existingIndexes);

        // Add unique index on (type, digestDate) if not exists
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
