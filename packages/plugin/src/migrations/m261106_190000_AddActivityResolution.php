<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Activity\ActivityTable;

class m261106_190000_AddActivityResolution extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->tableExists(ActivityTable::TABLE) && !$this->db->getTableSchema(ActivityTable::TABLE, true)->getColumn('resolvedAt')) {
            $this->addColumn(ActivityTable::TABLE, 'resolvedAt', $this->dateTime());
            $this->createIndex('freeform_activity_resolvedAt_level_dateCreated', ActivityTable::TABLE, ['resolvedAt', 'level', 'dateCreated']);
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
