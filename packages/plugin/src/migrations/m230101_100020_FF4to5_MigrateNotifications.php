<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100020_FF4to5_MigrateNotifications extends Migration
{
    public function safeUp(): bool
    {
        $this->renameTable('{{%freeform_notifications}}', '{{%freeform_notification_templates}}');
        $this->alterColumn('{{%freeform_notification_templates}}', 'bodyHtml', $this->mediumText());
        $this->alterColumn('{{%freeform_notification_templates}}', 'bodyText', $this->mediumText());

        $this->createTable(
            '{{%freeform_forms_notifications}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'class' => $this->string(255)->notNull(),
                'enabled' => $this->boolean()->defaultValue(true),
                'metadata' => $this->json(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_notifications}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE',
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100020_FF4to5_MigrateNotifications cannot be reverted.\n";

        return false;
    }
}
