<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230324_103021_RenameEmailNotificationTable migration.
 */
class m230324_103021_RenameEmailNotificationTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->renameTable(
            '{{%freeform_notifications}}',
            '{{%freeform_notification_templates}}'
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $this->renameTable(
            '{{%freeform_notification_templates}}',
            '{{%freeform_notifications}}'
        );

        return true;
    }
}
