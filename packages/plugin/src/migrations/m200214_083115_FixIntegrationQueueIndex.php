<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m200214_083115_FixIntegrationQueueIndex migration.
 */
class m200214_083115_FixIntegrationQueueIndex extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $indexes = $this->db->schema->getTableIndexes('{{%freeform_integrations_queue}}');
        foreach ($indexes as $index) {
            if ('freeform_integrations_queue_status_unq_idx' === $index->name) {
                $this->dropIndex('freeform_integrations_queue_status_unq_idx', '{{%freeform_integrations_queue}}');
                $this->createIndex(null, '{{%freeform_integrations_queue}}', 'status');
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropIndex(null, '{{%freeform_integrations_queue}}');
        $this->createIndex(null, '{{%freeform_integrations_queue}}', 'status', true);
    }
}
