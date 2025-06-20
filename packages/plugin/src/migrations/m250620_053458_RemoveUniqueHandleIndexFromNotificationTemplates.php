<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250620_053458_RemoveUniqueHandleIndexFromNotificationTemplates extends Migration
{
    private string $tableName = '{{%freeform_notification_templates}}';

    public function safeUp(): bool
    {
        $indexes = $this->db->getSchema()->getTableIndexes($this->tableName);
        foreach ($indexes as $index) {
            if ($index->isUnique && 1 === \count($index->columnNames) && 'handle' === $index->columnNames[0]) {
                $this->dropIndex($index->name, $this->tableName);

                break;
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
