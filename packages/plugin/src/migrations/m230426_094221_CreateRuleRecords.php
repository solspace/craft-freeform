<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230426_094221_CreateRuleRecords migration.
 */
class m230426_094221_CreateRuleRecords extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable('{{%freeform_rules}}', [
            'id' => $this->primaryKey(),
            'combinator' => $this->string(20)->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);

        // ============== Field rules ==============

        $this->createTable('{{%freeform_rules_fields}}', [
            'id' => $this->integer()->notNull(),
            'fieldId' => $this->integer()->notNull(),
            'display' => $this->string(10)->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);

        $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_fields}}', 'id');

        $this->addForeignKey(
            null,
            '{{%freeform_rules_fields}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_fields}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        // ============== Page rules ===============

        $this->createTable('{{%freeform_rules_pages}}', [
            'id' => $this->integer()->notNull(),
            'pageId' => $this->integer()->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);

        $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_pages}}', 'id');

        $this->addForeignKey(
            null,
            '{{%freeform_rules_pages}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_pages}}',
            'pageId',
            '{{%freeform_forms_pages}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        // ============== Condition rules ===============

        $this->createTable('{{%freeform_rules_conditions}}', [
            'id' => $this->primaryKey(),
            'ruleId' => $this->integer()->notNull(),
            'fieldId' => $this->integer()->notNull(),
            'operator' => $this->string(20)->notNull(),
            'value' => $this->text()->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);

        $this->addForeignKey(
            null,
            '{{%freeform_rules_conditions}}',
            'ruleId',
            '{{%freeform_rules}}',
            'id',
            'CASCADE',
            'CASCADE',
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_conditions}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE',
            'CASCADE',
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropForeignKey('freeform_rules_fields_id_fk', '{{%freeform_rules_fields}}');
        $this->dropForeignKey('freeform_rules_fields_fieldId_fk', '{{%freeform_rules_fields}}');

        $this->dropForeignKey('freeform_rules_pages_id_fk', '{{%freeform_rules_pages}}');
        $this->dropForeignKey('freeform_rules_pages_pageId_fk', '{{%freeform_rules_pages}}');

        $this->dropForeignKey('freeform_rules_conditions_ruleId_fk', '{{%freeform_rules_conditions}}');
        $this->dropForeignKey('freeform_rules_conditions_fieldId_fk', '{{%freeform_rules_conditions}}');

        $this->dropTableIfExists('{{%freeform_rules}}');
        $this->dropTableIfExists('{{%freeform_rules_fields}}');
        $this->dropTableIfExists('{{%freeform_rules_pages}}');
        $this->dropTableIfExists('{{%freeform_rules_conditions}}');

        return true;
    }
}
