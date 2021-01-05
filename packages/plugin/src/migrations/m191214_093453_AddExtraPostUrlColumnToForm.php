<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m191214_093453_AddExtraPostUrlColumnToForm migration.
 */
class m191214_093453_AddExtraPostUrlColumnToForm extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_forms}}', 'extraPostUrl')) {
                $this->addColumn('{{%freeform_forms}}', 'extraPostUrl', $this->string(255)->null());
            }

            if (!$this->db->columnExists('{{%freeform_forms}}', 'extraPostTriggerPhrase')) {
                $this->addColumn('{{%freeform_forms}}', 'extraPostTriggerPhrase', $this->string(255)->null());
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m191214_093453_AddExtraPostUrlColumnToForm cannot be reverted.\n";

        return false;
    }
}
