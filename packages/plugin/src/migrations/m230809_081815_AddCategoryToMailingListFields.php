<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230809_081815_AddCategoryToMailingListFields migration.
 */
class m230809_081815_AddCategoryToMailingListFields extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $table = '{{%freeform_mailing_list_fields}}';
        if (!$this->db->columnExists($table, 'category')) {
            $this->addColumn($table, 'category', $this->string(50));
            $this->createIndex(null, $table, ['mailingListId', 'category']);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $table = '{{%freeform_mailing_list_fields}}';
        if ($this->db->columnExists($table, 'category')) {
            $this->dropColumn($table, 'category');
        }

        return true;
    }
}
