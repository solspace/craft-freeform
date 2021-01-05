<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190529_135307_AddSlackWebhooksTable migration.
 */
class m190529_135307_AddWebhookTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable(
            '{{%freeform_webhooks}}',
            [
                'id' => $this->primaryKey(),
                'type' => $this->string()->notNull(),
                'name' => $this->string()->notNull(),
                'webhook' => $this->string()->notNull(),
                'settings' => $this->text(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createTable(
            '{{%freeform_webhooks_form_relations}}',
            [
                'id' => $this->primaryKey(),
                'webhookId' => $this->integer()->notNull(),
                'formId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_webhooks}}', 'type');
        $this->createIndex(null, '{{%freeform_webhooks_form_relations}}', 'webhookId');
        $this->createIndex(null, '{{%freeform_webhooks_form_relations}}', 'formId');
        $this->addForeignKey(
            null,
            '{{%freeform_webhooks_form_relations}}',
            'webhookId',
            '{{%freeform_webhooks}}',
            'id',
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_webhooks_form_relations}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            'CASCADE'
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        try {
            $prefix = $this->db->tablePrefix.'freeform_webhooks_form_relations_';
            $this->dropForeignKey($prefix.'webhookId_fk', '{{%freeform_webhooks_form_relations}}');
            $this->dropForeignKey($prefix.'formId_fk', '{{%freeform_webhooks_form_relations}}');
        } catch (\Exception $e) {
        }

        $this->dropTableIfExists('{{%freeform_webhooks}}');
        $this->dropTableIfExists('{{%freeform_webhooks_form_relations}}');

        return true;
    }
}
