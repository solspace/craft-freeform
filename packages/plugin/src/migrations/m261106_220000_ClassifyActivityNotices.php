<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Activity\ActivityTable;

class m261106_220000_ClassifyActivityNotices extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->tableExists(ActivityTable::TABLE)) {
            $this->update(ActivityTable::TABLE, ['level' => 'notice'], ['event' => ['validation', 'spam'], 'level' => 'warning'], [], false);
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
