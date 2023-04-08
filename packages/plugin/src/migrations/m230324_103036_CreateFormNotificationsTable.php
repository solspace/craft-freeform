<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230324_103036_CreateFormNotificationsTable migration.
 */
class m230324_103036_CreateFormNotificationsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_forms_notifications}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'enabled' => $this->boolean()->notNull()->defaultValue(true),
                'metadata' => $this->longText(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_notifications}}',
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
    public function safeDown(): bool
    {
        echo "m230324_103036_CreateFormNotificationsTable cannot be reverted.\n";

        return false;
    }
}
