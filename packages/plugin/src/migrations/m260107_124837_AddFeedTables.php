<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m260107_124837_AddFeedTables migration.
 */
class m260107_124837_AddFeedTables extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->tableExists('{{%freeform_feeds}}')) {
            $this->createTable(
                '{{%freeform_feeds}}',
                [
                    'id' => $this->primaryKey(),
                    'hash' => $this->string()->notNull(),
                    'min' => $this->string(),
                    'max' => $this->string(),
                    'issueDate' => $this->dateTime()->notNull(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->createIndex(null, '{{%freeform_feeds}}', ['hash'], true);
        }

        if (!$this->db->tableExists('{{%freeform_feed_messages}}')) {
            $this->createTable(
                '{{%freeform_feed_messages}}',
                [
                    'id' => $this->primaryKey(),
                    'feedId' => $this->integer()->notNull(),
                    'message' => $this->text()->notNull(),
                    'conditions' => $this->text()->notNull(),
                    'type' => $this->string()->notNull(),
                    'seen' => $this->boolean()->notNull()->defaultValue(false),
                    'issueDate' => $this->dateTime()->notNull(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->addForeignKey(
                'freeform_feed_messages_feedId_fk',
                '{{%freeform_feed_messages}}',
                'feedId',
                '{{%freeform_feeds}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        if (!$this->db->tableExists('{{%freeform_notification_log}}')) {
            $this->createTable(
                '{{%freeform_notification_log}}',
                [
                    'id' => $this->primaryKey(),
                    'type' => $this->string(30)->notNull(),
                    'name' => $this->string(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->createIndex(null, '{{%freeform_notification_log}}', ['type', 'dateCreated']);
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m260107_124837_AddFeedTables cannot be reverted.\n";

        return true;
    }
}
