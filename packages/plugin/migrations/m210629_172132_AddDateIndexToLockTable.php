<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m210629_172132_AddDateIndexToLockTable extends Migration
{
    public function safeUp(): bool
    {
        try {
            if ($this->db->tableExists('{{%freeform_lock}}')) {
                $this->createIndex(null, '{{%freeform_lock}}', ['dateCreated']);
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown(): bool
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
