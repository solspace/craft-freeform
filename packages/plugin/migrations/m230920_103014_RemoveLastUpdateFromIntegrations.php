<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230920_103014_AddSingletonToIntegrationTable migration.
 */
class m230920_103014_RemoveLastUpdateFromIntegrations extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_integrations}}';
        if ($this->db->columnExists($table, 'lastUpdate')) {
            $this->dropColumn($table, 'lastUpdate');
        }

        return true;
    }

    public function safeDown(): bool
    {
        $table = '{{%freeform_integrations}}';
        if (!$this->db->columnExists($table, 'lastUpdate')) {
            $this->addColumn($table, 'lastUpdate', $this->dateTime()->null());
        }

        return true;
    }
}
