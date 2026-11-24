<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Records\FormRecord;

class m261123_225500_AllowFormsTrash extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists(FormRecord::TABLE, 'dateTrashed')) {
            $this->renameColumn(FormRecord::TABLE, 'dateMergeTrashed', 'dateTrashed');
        }
        if (!$this->db->columnExists(FormRecord::TABLE, 'trashedFromMerge')) {
            $this->addColumn(FormRecord::TABLE, 'trashedFromMerge', $this->boolean()->notNull()->defaultValue(false));
            $this->update(FormRecord::TABLE, ['trashedFromMerge' => true], ['not', ['dateTrashed' => null]]);
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
