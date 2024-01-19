<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100020_FF4to5_MigrateLayout extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_forms_layouts}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_layouts}}', ['formId']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_layouts}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_pages}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'layoutId' => $this->integer()->notNull(),
                'label' => $this->string(255)->notNull(),
                'order' => $this->integer()->defaultValue(0),
                'metadata' => $this->longText(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ],
        );

        $this->createIndex(null, '{{%freeform_forms_pages}}', ['formId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_pages}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_pages}}',
            ['layoutId'],
            '{{%freeform_forms_layouts}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_rows}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'layoutId' => $this->integer()->notNull(),
                'order' => $this->integer()->defaultValue(0),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_rows}}', ['formId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_rows}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_rows}}',
            ['layoutId'],
            '{{%freeform_forms_layouts}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_fields}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'type' => $this->string(255)->notNull(),
                'metadata' => $this->longText(),
                'rowId' => $this->integer()->null(),
                'order' => $this->integer()->defaultValue(0),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_fields}}', ['rowId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_fields}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_fields}}',
            ['rowId'],
            '{{%freeform_forms_rows}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_favorite_fields}}',
            [
                'id' => $this->primaryKey(),
                'userId' => $this->integer(),
                'label' => $this->string(255)->notNull(),
                'type' => $this->string(255)->notNull(),
                'metadata' => $this->longText(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_favorite_fields}}',
            ['userId'],
            '{{%users}}',
            ['id'],
            'CASCADE'
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100020_FF4to5_MigrateLayout cannot be reverted.\n";

        return false;
    }
}
