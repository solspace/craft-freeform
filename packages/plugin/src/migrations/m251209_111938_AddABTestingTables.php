<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m251209_111938_AddABTestingTables extends Migration
{
    public function safeUp(): bool
    {
        // ------------------------------------------
        //        A/B Tests
        // ------------------------------------------
        if (!$this->db->tableExists('{{%freeform_ab_tests}}')) {
            $this->createTable('{{%freeform_ab_tests}}', [
                'id' => $this->primaryKey(),
                'name' => $this->string()->notNull(),
                'description' => $this->text(),
                'startDate' => $this->dateTime(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]);
        }

        // ------------------------------------------
        //        A/B Test Variants
        // ------------------------------------------
        if (!$this->db->tableExists('{{%freeform_ab_tests_variants}}')) {
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
        }

        // ------------------------------------------
        //        A/B Test Assignments
        // ------------------------------------------
        if (!$this->db->tableExists('{{%freeform_ab_tests_assignments}}')) {
            $this->createTable('{{%freeform_ab_tests_assignments}}', [
                'id' => $this->primaryKey(),
                'userId' => $this->integer()->notNull(),
                'abTestId' => $this->integer()->notNull(),
                'abVariantId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]);

            $this->addForeignKey(
                'fk_ab_tests_assignments_abTestId',
                '{{%freeform_ab_tests_assignments}}',
                'abTestId',
                '{{%freeform_ab_tests}}',
                'id',
                'CASCADE'
            );

            $this->addForeignKey(
                'fk_ab_tests_assignments_userId',
                '{{%freeform_ab_tests_assignments}}',
                'userId',
                '{{%users}}',
                'id',
                'CASCADE'
            );

            $this->addForeignKey(
                'fk_ab_tests_assignments_abVariantId',
                '{{%freeform_ab_tests_assignments}}',
                'abVariantId',
                '{{%freeform_ab_tests_variants}}',
                'id',
                'CASCADE'
            );

            $this->createIndex(
                'idx_ab_tests_assmnts_userId_abTestId',
                '{{%freeform_ab_tests_assignments}}',
                ['userId', 'abTestId'],
                true,
            );
        }

        // ------------------------------------------
        //        A/B Test Statistics
        // ------------------------------------------
        if (!$this->db->tableExists('{{%freeform_ab_tests_statistics}}')) {
            $this->createTable('{{%freeform_ab_tests_statistics}}', [
                'id' => $this->primaryKey(),
                'abTestId' => $this->integer()->notNull(),
                'abVariantId' => $this->integer()->notNull(),
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
                'fk_ab_tests_statistics_abVariantId',
                '{{%freeform_ab_tests_statistics}}',
                'abVariantId',
                '{{%freeform_ab_tests_variants}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'fk_ab_tests_stats_formId',
                '{{%freeform_ab_tests_statistics}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                'CASCADE'
            );

            $this->createIndex(
                'idx_ab_tests_stats_abTestId_status',
                '{{%freeform_ab_tests_statistics}}',
                ['abTestId', 'status'],
            );
            $this->createIndex(
                'idx_ab_tests_stats_abTestId_abVariantId_formId_status',
                '{{%freeform_ab_tests_statistics}}',
                ['abTestId', 'abVariantId', 'formId', 'status'],
            );
            $this->createIndex(
                'idx_ab_tests_stats_abTestId_abVariantId_formId_sessionId',
                '{{%freeform_ab_tests_statistics}}',
                ['abTestId', 'abVariantId', 'formId', 'sessionId'],
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->tableExists('{{%freeform_ab_tests_assignments}}')) {
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_assignments}}', ['userId']);
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_assignments}}', ['abTestId']);
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_assignments}}', ['abVariantId']);
            $this->dropTableIfExists('{{%freeform_ab_tests_assignments}}');
        }

        if ($this->db->tableExists('{{%freeform_ab_tests_statistics}}')) {
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_statistics}}', ['abTestId']);
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_statistics}}', ['formId']);
            $this->dropTableIfExists('{{%freeform_ab_tests_statistics}}');
        }

        if ($this->db->tableExists('{{%freeform_ab_tests_variants}}')) {
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_variants}}', ['abTestId']);
            $this->dropForeignKeyIfExists('{{%freeform_ab_tests_variants}}', ['formId']);
            $this->dropTableIfExists('{{%freeform_ab_tests_variants}}');
        }

        $this->dropTableIfExists('{{%freeform_ab_tests}}');

        return true;
    }
}
