<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m201209_162655_AddAutoTextColumnToNotifications extends Migration
{
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_notifications}}', 'autoText')) {
                $this->addColumn(
                    '{{%freeform_notifications}}',
                    'autoText',
                    $this->boolean()->notNull()->defaultValue(true)
                );

                $this->update('{{%freeform_notifications}}', ['autoText' => false]);
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown()
    {
        try {
            if ($this->db->columnExists('{{%freeform_notifications}}', 'autoText')) {
                $this->dropColumn('{{%freeform_notifications}}', 'autoText');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
