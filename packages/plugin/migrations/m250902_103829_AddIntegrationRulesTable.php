<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

class m250902_103829_AddIntegrationRulesTable extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->tableExists('{{%freeform_rules_integrations}}')) {
            \Craft::warning("Table 'freeform_rules_integrations' already exists. Skipping migration.", __METHOD__);

            return true;
        }

        $this->createTable(
            '{{%freeform_rules_integrations}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'push' => $this->boolean()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            'fk_integrations_ruleId',
            '{{%freeform_rules_integrations}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            'fk_integrationId',
            '{{%freeform_rules_integrations}}',
            'integrationId',
            '{{%freeform_forms_integrations}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->tableExists('{{%freeform_rules_integrations}}')) {
            $this->dropAllForeignKeysToTable('{{%freeform_rules_integrations}}');
            $this->dropTable('{{%freeform_rules_integrations}}');
        }

        return true;
    }
}
