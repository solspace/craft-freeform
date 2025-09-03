<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250903_063546_AddIdentifierToNotificationLogs extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->columnExists('{{%freeform_notification_log}}', 'identifier')) {
            return true;
        }

        $this->addColumn(
            '{{%freeform_notification_log}}',
            'identifier',
            $this->string(100)->after('type')
        );

        $this->createIndex(
            'idx_type_identifier_name_digestDate',
            '{{%freeform_notification_log}}',
            ['type', 'identifier', 'name', 'digestDate'],
        );

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists('{{%freeform_notification_log}}', 'identifier')) {
            $this->dropColumn('{{%freeform_notification_log}}', 'identifier');
        }

        return true;
    }
}
