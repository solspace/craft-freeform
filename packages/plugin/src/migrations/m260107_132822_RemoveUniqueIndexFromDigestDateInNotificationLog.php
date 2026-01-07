<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m260107_132822_RemoveUniqueIndexFromDigestDateInNotificationLog migration.
 */
class m260107_132822_RemoveUniqueIndexFromDigestDateInNotificationLog extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_notification_log}}';

        // Check if table exists before touching anything
        $schema = $this->db->getTableSchema($table);
        if (!$schema) {
            \Craft::warning("Skipping remove index migration: {$table} does not exist", __METHOD__);

            return true;
        }

        $indexes = $this->db->schema->getTableIndexes($table);
        foreach ($indexes as $index) {
            $columns = $index->columnNames;
            if (2 !== \count($columns) || true !== $index->isUnique) {
                continue;
            }

            $hasType = \in_array('type', $columns, true);
            $hasDigestDate = \in_array('digestDate', $columns, true);

            if ($hasType && $hasDigestDate) {
                $this->dropIndex($index->name, $table);
            }
        }

        $this->createIndex(
            'idx_type_digestDate_identifier',
            $table,
            ['type', 'digestDate', 'identifier'],
            true
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m260107_132822_RemoveUniqueIndexFromDigestDateInNotificationLog cannot be reverted.\n";

        return false;
    }
}
