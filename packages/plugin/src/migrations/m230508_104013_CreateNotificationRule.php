<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230508_104013_CreateNotificationRule migration.
 */
class m230508_104013_CreateNotificationRule extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->createTable('{{%freeform_rules_notifications}}', [
            'id' => $this->integer()->notNull(),
            'notificationId' => $this->integer()->notNull(),
            'send' => $this->boolean()->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);

        $this->addPrimaryKey('PRIMARY_KEY', '{{%freeform_rules_notifications}}', 'id');

        $this->addForeignKey(
            null,
            '{{%freeform_rules_notifications}}',
            'id',
            '{{%freeform_rules}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_rules_notifications}}',
            'notificationId',
            '{{%freeform_forms_notifications}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $this->dropForeignKey('freeform_rules_notifications_id_fk', '{{%freeform_rules_notifications}}');
        $this->dropForeignKey('freeform_rules_notifications_notificationId_fk', '{{%freeform_rules_notifications}}');

        $this->dropTableIfExists('{{%freeform_rules_notifications}}');

        return true;
    }
}
