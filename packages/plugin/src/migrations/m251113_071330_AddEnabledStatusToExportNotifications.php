<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m251113_071330_AddEnabledStatusToExportNotifications extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->columnExists('{{%freeform_export_notifications}}', 'enabled')) {
            return true;
        }

        $this->addColumn(
            '{{%freeform_export_notifications}}',
            'enabled',
            $this->boolean()->defaultValue(true)->after('profileId')
        );

        return true;
    }

    public function safeDown(): bool
    {
        if (!$this->db->columnExists('{{%freeform_export_notifications}}', 'enabled')) {
            return true;
        }

        $this->dropColumn('{{%freeform_export_notifications}}', 'enabled');

        return true;
    }
}
