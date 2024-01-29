<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100060_FF4to5_MigrateConditionalRules extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_rules}}',
            [
                'id' => $this->primaryKey(),
                'combinator' => $this->string(20)->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        // ------------------------------------------------------------------

        $this->createTable(
            '{{%freeform_rules_fields}}',
            [
                'id' => $this->integer()->notNull(),
                'fieldId' => $this->integer()->notNull(),
                'display' => $this->string(10)->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        if ($this->db->getIsMysql()) {
            $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_fields}}', 'id');
        }

        $this->addForeignKey(
            null,
            '{{%freeform_rules_fields}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_fields}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE'
        );

        // ------------------------------------------------------------------

        $this->createTable(
            '{{%freeform_rules_pages}}',
            [
                'id' => $this->integer()->notNull(),
                'pageId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        if ($this->db->getIsMysql()) {
            $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_pages}}', 'id');
        }

        $this->addForeignKey(
            null,
            '{{%freeform_rules_pages}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_pages}}',
            'pageId',
            '{{%freeform_forms_pages}}',
            'id',
            'CASCADE'
        );

        // ------------------------------------------------------------------

        $this->createTable(
            '{{%freeform_rules_notifications}}',
            [
                'id' => $this->integer()->notNull(),
                'notificationId' => $this->integer()->notNull(),
                'send' => $this->boolean()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        if ($this->db->getIsMysql()) {
            $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_notifications}}', 'id');
        }

        $this->addForeignKey(
            null,
            '{{%freeform_rules_notifications}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_notifications}}',
            'notificationId',
            '{{%freeform_forms_notifications}}',
            'id',
            'CASCADE'
        );

        // ------------------------------------------------------------------

        $this->createTable(
            '{{%freeform_rules_conditions}}',
            [
                'id' => $this->primaryKey(),
                'ruleId' => $this->integer()->notNull(),
                'fieldId' => $this->integer()->notNull(),
                'operator' => $this->string(20)->notNull(),
                'value' => $this->text()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_conditions}}',
            'ruleId',
            '{{%freeform_rules}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_conditions}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE'
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100060_FF4to5_MigrateConditionalRules cannot be reverted.\n";

        return false;
    }
}
