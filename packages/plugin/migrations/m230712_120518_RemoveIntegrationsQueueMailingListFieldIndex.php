<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230712_120518_RemoveIntegrationsQueueMailingListFieldIndex migration.
 */
class m230712_120518_RemoveIntegrationsQueueMailingListFieldIndex extends Migration
{
    public function safeUp(): bool
    {
        $foreignKeys = $this->db->schema->getTableForeignKeys('{{%freeform_integrations_queue}}');
        foreach ($foreignKeys as $key) {
            if ('freeform_integrations_queue_id_fk' === $key->name) {
                $this->dropForeignKey(
                    'freeform_integrations_queue_id_fk',
                    '{{%freeform_integrations_queue}}'
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        $this->addForeignKey(
            null,
            '{{%freeform_integrations_queue}}',
            'id',
            '{{%freeform_mailing_list_fields}}',
            'id',
            'CASCADE'
        );

        return true;
    }
}
