<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Records\FormRecord;
use yii\db\Expression;

class m261123_225500_AllowFormsTrash extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists(FormRecord::TABLE, 'dateTrashed')) {
            $this->addColumn(FormRecord::TABLE, 'dateTrashed', $this->dateTime()->null());
        }
        if (!$this->db->columnExists(FormRecord::TABLE, 'trashedFromMerge')) {
            $this->addColumn(FormRecord::TABLE, 'trashedFromMerge', $this->boolean()->notNull()->defaultValue(false));
        }
        if ($this->db->columnExists(FormRecord::TABLE, 'dateMergeTrashed')) {
            $this->update(
                FormRecord::TABLE,
                ['dateTrashed' => new Expression('[[dateMergeTrashed]]'), 'trashedFromMerge' => true],
                ['not', ['dateMergeTrashed' => null]],
                updateTimestamp: false,
            );
            $this->dropColumn(FormRecord::TABLE, 'dateMergeTrashed');
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
