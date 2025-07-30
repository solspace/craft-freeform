<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250730_145058_RemoveUniqueHandleIndexFromNotificationTemplates extends Migration
{
    private const TABLE = '{{%freeform_notification_templates}}';

    public function safeUp(): bool
    {
        if ($this->db->columnExists(self::TABLE, 'formId') && $this->db->columnExists(self::TABLE, 'handle')) {
            // find the foreign key name
            $foreignKeys = $this->db->getSchema()->getTableForeignKeys(self::TABLE);
            foreach ($foreignKeys as $foreignKey) {
                if ($foreignKey->columnNames === ['formId'] || $foreignKey->columnNames === ['handle']) {
                    $this->dropForeignKey($foreignKey->name, self::TABLE);

                    break;
                }
            }

            if ('pgsql' === $this->db->driverName) {
                $this->execute(
                    \sprintf(
                        'ALTER TABLE %s DROP CONSTRAINT IF EXISTS %s',
                        self::TABLE,
                        'freeform_notification_templates_formId_handle_key'
                    )
                );
            } else {
                $this->dropIndexIfExists(self::TABLE, ['formId', 'handle'], true);
            }

            $this->createIndex('freeform_notification_templates_formId', self::TABLE, ['formId'], true);

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
        return true;
    }
}
