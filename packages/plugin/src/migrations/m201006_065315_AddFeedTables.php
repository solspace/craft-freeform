<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m201006_065315_AddFeedTables migration.
 */
class m201006_065315_AddFeedTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
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

        if (!$this->db->tableExists('{{%freeform_lock}}')) {
            $this->createTable(
                '{{%freeform_lock}}',
                [
                    'id' => $this->primaryKey(),
                    'key' => $this->string()->notNull(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );
            $this->createIndex(null, '{{%freeform_lock}}', ['key', 'dateCreated']);
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $keys = $this->db->schema->getTableForeignKeys('{{%freeform_feed_messages}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_feed_messages}}');
        }

        $this->dropTableIfExists('{{%freeform_lock}}');
        $this->dropTableIfExists('{{%freeform_feed_messages}}');
        $this->dropTableIfExists('{{%freeform_feeds}}');
        $this->dropTableIfExists('{{%freeform_notification_log}}');

        return true;
    }
}
