<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230223_143643_RemoveIntegrationsQueueMailingListFieldIndex migration.
 */
class m230223_143643_RemoveIntegrationsQueueMailingListFieldIndex extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
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

    /**
     * {@inheritdoc}
     */
    public function safeDown()
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
