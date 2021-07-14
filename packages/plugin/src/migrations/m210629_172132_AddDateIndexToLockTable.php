<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m210629_172132_AddDateIndexToLockTable extends Migration
{
    public function safeUp()
    {
        try {
            if ($this->db->tableExists('{{%freeform_lock}}')) {
                $this->createIndex(null, '{{%freeform_lock}}', ['dateCreated']);
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown()
    {
        try {
            if ($this->db->tableExists('{{%freeform_lock}}')) {
                $this->dropIndex('freeform_lock_dateCreated_idx', '{{%freeform_lock}}');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
