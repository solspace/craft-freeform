<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m260817_155623_AddCronExpressionToExportNotifications extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->columnExists('{{%freeform_export_notifications}}', 'cronExpression')) {
            return true;
        }

        $this->addColumn(
            '{{%freeform_export_notifications}}',
            'cronExpression',
            $this->string(255)->after('frequency')
        );

        return true;
    }

    public function safeDown(): bool
    {
        if (!$this->db->columnExists('{{%freeform_export_notifications}}', 'cronExpression')) {
            return true;
        }

        $this->dropColumn('{{%freeform_export_notifications}}', 'cronExpression');

        return true;
    }
}
