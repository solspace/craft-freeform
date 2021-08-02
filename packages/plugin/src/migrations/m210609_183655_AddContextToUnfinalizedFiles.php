<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m210609_183655_AddContextToUnfinalizedFiles migration.
 */
class m210609_183655_AddContextToUnfinalizedFiles extends Migration
{
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_unfinalized_files}}', 'formToken')) {
                $this->addColumn('{{%freeform_unfinalized_files}}', 'fieldHandle', $this->string(255));
                $this->addColumn('{{%freeform_unfinalized_files}}', 'formToken', $this->string(255));
                $this->createIndex(null, '{{%freeform_unfinalized_files}}', ['fieldHandle', 'formToken']);
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown()
    {
        try {
            if ($this->db->columnExists('{{%freeform_unfinalized_files}}', 'contextId')) {
                $this->dropColumn('{{%freeform_unfinalized_files}}', 'fieldHandle');
                $this->dropColumn('{{%freeform_unfinalized_files}}', 'formToken');
                $this->dropIndex('freeform_unfinalized_files_fieldHandle_formToken_idx', '{{%freeform_unfinalized_files}}');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
