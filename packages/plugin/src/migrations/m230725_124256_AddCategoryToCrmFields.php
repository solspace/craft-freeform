<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230725_124256_AddCategoryToCrmFields migration.
 */
class m230725_124256_AddCategoryToCrmFields extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $table = '{{%freeform_crm_fields}}';
        if (!$this->db->columnExists($table, 'category')) {
            $this->addColumn($table, 'category', $this->string(50));
            $this->createIndex(null, $table, ['integrationId', 'category']);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $table = '{{%freeform_crm_fields}}';
        if ($this->db->columnExists($table, 'category')) {
            $this->dropColumn($table, 'category');
        }

        return true;
    }
}
