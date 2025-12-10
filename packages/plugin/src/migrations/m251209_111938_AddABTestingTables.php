<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m251209_111938_AddABTestingTables extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable('{{%freeform_ab_tests}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
            'description' => $this->text(),
            'startDate' => $this->dateTime(),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->uid(),
        ]);

        $this->createTable('{{%freeform_ab_tests_variants}}', [
            'id' => $this->primaryKey(),
            'abTestId' => $this->integer()->notNull(),
            'formId' => $this->integer()->notNull(),
            'weight' => $this->integer()->notNull(),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->uid(),
        ]);

        $this->addForeignKey(
            'fk_ab_tests_variants_abTestId',
            '{{%freeform_ab_tests_variants}}',
            'abTestId',
            '{{%freeform_ab_tests}}',
            'id',
            'CASCADE'
        );
        $this->addForeignKey(
            'fk_ab_tests_variants_formId',
            '{{%freeform_ab_tests_variants}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            'CASCADE'
        );

        $this->createTable('{{%freeform_ab_tests_statistics}}', [
            'id' => $this->primaryKey(),
            'abTestId' => $this->integer()->notNull(),
            'formId' => $this->integer()->notNull(),
            'sessionId' => $this->string()->notNull(),
            'status' => $this->string(20)->notNull(),
            'lastError' => $this->text(),
            'lastField' => $this->string(255),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->uid(),
        ]);

        $this->addForeignKey(
            'fk_ab_tests_statistics_abTestId',
            '{{%freeform_ab_tests_statistics}}',
            'abTestId',
            '{{%freeform_ab_tests}}',
            'id',
            'CASCADE'
        );
        $this->addForeignKey(
            'fk_ab_tests_statistics_formId',
            '{{%freeform_ab_tests_statistics}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            'CASCADE'
        );

        $this->createIndex(
            'idx_ab_tests_statistics_abTestId_status',
            '{{%freeform_ab_tests_statistics}}',
            ['abTestId', 'status'],
        );
        $this->createIndex(
            'idx_ab_tests_statistics_abTestId_formId_status',
            '{{%freeform_ab_tests_statistics}}',
            ['abTestId', 'formId', 'status'],
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropForeignKeyIfExists('{{%freeform_ab_tests_variants}}', ['abTestId']);
        $this->dropForeignKeyIfExists('{{%freeform_ab_tests_variants}}', ['formId']);
        $this->dropTableIfExists('{{%freeform_ab_tests_variants}}');

        $this->dropForeignKeyIfExists('{{%freeform_ab_tests_statistics}}', ['abTestId']);
        $this->dropForeignKeyIfExists('{{%freeform_ab_tests_statistics}}', ['formId']);
        $this->dropTableIfExists('{{%freeform_ab_tests_statistics}}');

        $this->dropTableIfExists('{{%freeform_ab_tests}}');

        return true;
    }
}
