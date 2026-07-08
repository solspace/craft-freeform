<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230824_163145_RemoveWebhooksTable migration.
 */
class m230824_163145_RemoveWebhooksTable extends Migration
{
    public function safeUp(): bool
    {
        $foreignKeys = $this->db->schema->getTableForeignKeys('{{%freeform_webhooks}}');
        foreach ($foreignKeys as $key) {
            $this->dropForeignKey(
                $key->name,
                '{{%freeform_webhooks}}'
            );
        }

        $foreignKeys = $this->db->schema->getTableForeignKeys('{{%freeform_webhooks_form_relations}}');
        foreach ($foreignKeys as $key) {
            $this->dropForeignKey(
                $key->name,
                '{{%freeform_webhooks_form_relations}}'
            );
        }

        $this->dropTableIfExists('{{%freeform_webhooks}}');
        $this->dropTableIfExists('{{%freeform_webhooks_form_relations}}');

        return true;
    }

    public function safeDown(): bool
    {
        $this->createTable('{{%freeform_webhooks}}', [
            'id' => $this->primaryKey(),
            'type' => $this->string()->notNull(),
            'name' => $this->string()->notNull(),
            'webhook' => $this->string()->notNull(),
            'settings' => $this->text(),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->string()->notNull(),
        ]);
        $this->createIndex(null, '{{%freeform_webhooks}}', ['type']);

        $this->createTable('{{%freeform_webhooks_form_relations}}', [
            'id' => $this->primaryKey(),
            'webhookId' => $this->integer()->notNull(),
            'formId' => $this->integer()->notNull(),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->string()->notNull(),
        ]);
        $this->createIndex(null, '{{%freeform_webhooks_form_relations}}', ['webhookId']);
        $this->createIndex(null, '{{%freeform_webhooks_form_relations}}', ['formId']);
        $this->addForeignKey(
            null,
            '{{%freeform_webhooks_form_relations}}',
            ['webhookId'],
            '{{%freeform_webhooks}}',
            ['id'],
            'CASCADE',
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_webhooks_form_relations}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE',
            'CASCADE'
        );

        return true;
    }
}
