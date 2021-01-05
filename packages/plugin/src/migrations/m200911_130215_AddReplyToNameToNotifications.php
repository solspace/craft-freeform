<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m200911_130215_AddReplyToNameToNotifications migration.
 */
class m200911_130215_AddReplyToNameToNotifications extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_notifications}}', 'replyToName')) {
                $this->addColumn('{{%freeform_notifications}}', 'replyToName', $this->string(255));
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_notifications}}', 'replyToName')) {
                $this->dropColumn('{{%freeform_notifications}}', 'replyToName');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
