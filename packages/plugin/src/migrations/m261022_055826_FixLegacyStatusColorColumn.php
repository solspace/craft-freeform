<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m261022_055826_FixLegacyStatusColorColumn extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->getIsMysql()) {
            return true;
        }

        $table = '{{%freeform_statuses}}';
        $schema = $this->db->getTableSchema($table, true);
        $column = $schema->columns['color'] ?? null;

        if (!$column || !str_starts_with(strtolower($column->dbType), 'enum(')) {
            return true;
        }

        // Refuse to shorten unexpected custom enum labels when matching the install schema.
        if (!$column->enumValues || max(array_map('strlen', $column->enumValues)) > 30) {
            throw new \RuntimeException('Cannot safely convert the Freeform status color ENUM to VARCHAR(30). Check its enum labels before retrying.');
        }

        // Legacy installs retain an ENUM that excludes Craft 5 colors such as teal.
        // Keep existing color values intact, including the older grey/light/turquoise names.
        $this->alterColumn($table, 'color', $this->string(30));

        return true;
    }

    public function safeDown(): bool
    {
        echo "The legacy status color ENUM cannot represent all supported colors.\n";

        return false;
    }
}
