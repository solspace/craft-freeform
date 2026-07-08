<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m211109_144235_RemoveContextFromUnfinalizedAssets migration.
 */
class m211109_144235_RemoveContextFromUnfinalizedAssets extends Migration
{
    public function safeUp(): bool
    {
        try {
            if ($this->db->columnExists('{{%freeform_unfinalized_files}}', 'contextId')) {
                $this->dropIndex('freeform_unfinalized_files_contextId_idx', '{{%freeform_unfinalized_files}}');

                $this->dropColumn('{{%freeform_unfinalized_files}}', 'contextId');
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown(): bool
    {
        try {
            if (!$this->db->columnExists('{{%freeform_unfinalized_files}}', 'contextId')) {
                $this->addColumn('{{%freeform_unfinalized_files}}', 'contextId', $this->string(255));

                $this->createIndex(
                    'freeform_unfinalized_files_contextId_idx',
                    '{{%freeform_unfinalized_files}}',
                    ['contextId']
                );
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
