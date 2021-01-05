<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m210105_145259_AddGoogleTagManagerColumnsToForms extends Migration
{
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_forms}}', 'gtmEnabled')) {
                $this->addColumn('{{%freeform_forms}}', 'gtmEnabled', $this->boolean()->defaultValue(false));
            }

            if (!$this->db->columnExists('{{%freeform_forms}}', 'gtmId')) {
                $this->addColumn('{{%freeform_forms}}', 'gtmId', $this->string()->null());
            }

            if (!$this->db->columnExists('{{%freeform_forms}}', 'gtmEventName')) {
                $this->addColumn('{{%freeform_forms}}', 'gtmEventName', $this->string()->null());
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown()
    {
        try {
            if ($this->db->columnExists('{{%freeform_forms}}', 'gtmEnabled')) {
                $this->dropColumn('{{%freeform_forms}}', 'gtmEnabled');
            }

            if ($this->db->columnExists('{{%freeform_forms}}', 'gtmId')) {
                $this->dropColumn('{{%freeform_forms}}', 'gtmId');
            }

            if ($this->db->columnExists('{{%freeform_forms}}', 'gtmEventName')) {
                $this->dropColumn('{{%freeform_forms}}', 'gtmEventName');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
