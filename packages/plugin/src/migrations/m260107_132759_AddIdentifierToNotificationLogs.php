<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m260107_132759_AddIdentifierToNotificationLogs migration.
 */
class m260107_132759_AddIdentifierToNotificationLogs extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_notification_log}}';

        // Check if table exists before touching anything
        $schema = $this->db->getTableSchema($table);
        if (!$schema) {
            \Craft::warning("Skipping identifier migration: {$table} does not exist", __METHOD__);

            return true;
        }

        // Already handled in m250903_063546_AddIdentifierToNotificationLogs
        if ($this->db->columnExists($table, 'identifier')) {
            return true;
        }

        $this->addColumn(
            $table,
            'identifier',
            $this->string(100)->after('type')
        );

        $this->createIndex(
            'idx_type_identifier_name_digestDate',
            $table,
            ['type', 'identifier', 'name', 'digestDate'],
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m260107_132759_AddIdentifierToNotificationLogs cannot be reverted.\n";

        return false;
    }
}
