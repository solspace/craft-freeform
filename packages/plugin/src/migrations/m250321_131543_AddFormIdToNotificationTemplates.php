<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250321_131543_AddFormIdToNotificationTemplates extends Migration
{
    private const TABLE = '{{%freeform_notification_templates}}';

    public function safeUp(): bool
    {
        if (!$this->db->columnExists(self::TABLE, 'formId')) {
            $this->addColumn(self::TABLE, 'formId', $this->integer()->after('id'));
            $this->addForeignKey(
                null,
                self::TABLE,
                ['formId'],
                '{{%freeform_forms}}',
                ['id'],
                'CASCADE'
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists(self::TABLE, 'formId')) {
            // find the foreign key name
            $foreignKeys = $this->db->getSchema()->getTableForeignKeys(self::TABLE);
            foreach ($foreignKeys as $foreignKey) {
                if ($foreignKey->columnNames === ['formId']) {
                    $this->dropForeignKey($foreignKey->name, self::TABLE);

                    break;
                }
            }

            $this->dropColumn(self::TABLE, 'formId');
        }

        return true;
    }
}
