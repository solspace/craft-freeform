<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Records\FormRecord;

class m261123_224500_AddMergeTrash extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists(FormRecord::TABLE, 'dateMergeTrashed') && !$this->db->columnExists(FormRecord::TABLE, 'dateTrashed')) {
            $this->addColumn(FormRecord::TABLE, 'dateMergeTrashed', $this->dateTime()->null());
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
