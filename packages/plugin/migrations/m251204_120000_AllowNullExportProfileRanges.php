<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m251204_120000_AllowNullExportProfileRanges extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_export_profiles}}';
        if (!$this->db->tableExists($table)) {
            return true;
        }

        $schema = $this->db->getTableSchema($table, true);
        if ($schema && isset($schema->columns['rangeStart'])) {
            $this->alterColumn($table, 'rangeStart', $this->string(255)->null());
        }

        if ($schema && isset($schema->columns['rangeEnd'])) {
            $this->alterColumn($table, 'rangeEnd', $this->string(255)->null());
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m251204_120000_AllowNullExportProfileRanges cannot be reverted.\n";

        return false;
    }
}
