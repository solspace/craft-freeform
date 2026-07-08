<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m190529_135307_AddSlackWebhooksTable migration.
 */
class m190529_135307_AddWebhookTables extends Migration
{
    public function safeUp(): bool
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
            ForeignKey::CASCADE
        );
        $this->addForeignKey(
            null,
            '{{%freeform_webhooks_form_relations}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown(): bool
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
