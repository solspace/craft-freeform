<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250903_152441_RemoveUniqueIndexFromDigestDateInNotificationLog extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_notification_log}}';
        $schema = $this->db->getTableSchema($table, true);
        if (!$schema) {
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
        $table = '{{%freeform_notification_log}}';
        $schema = $this->db->getTableSchema($table, true);
        if (!$schema) {
            return true;
        }

        $indexes = $this->db->schema->getTableIndexes($table);
        foreach ($indexes as $index) {
            $columns = $index->columnNames;
            if (3 !== \count($columns) || true !== $index->isUnique) {
                continue;
            }

            $hasType = \in_array('type', $columns, true);
            $hasDigestDate = \in_array('digestDate', $columns, true);
            $hasIdentifier = \in_array('identifier', $columns, true);

            if ($hasType && $hasDigestDate && $hasIdentifier) {
                $this->dropIndex($index->name, $table);
            }
        }

        $this->createIndex(
            null,
            $table,
            ['type', 'digestDate'],
            true
        );

        return true;
    }
}
