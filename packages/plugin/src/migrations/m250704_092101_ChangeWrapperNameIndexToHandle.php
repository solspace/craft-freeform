<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250704_092101_ChangeWrapperNameIndexToHandle extends Migration
{
    public function safeUp(): bool
    {
        if (!\Craft::$app->getDb()->tableExists('{{%freeform_notification_template_wrappers}}')) {
            return true;
        }

        // Drop the existing name index
        $this->dropIndexIfExists(
            '{{%freeform_notification_template_wrappers}}',
            ['name'],
            true,
        );

        // Create a new index on the handle column
        $this->createIndex(
            'handle',
            '{{%freeform_notification_template_wrappers}}',
            ['handle'],
            true
        );

        return true;
    }

    public function safeDown(): bool
    {
        if (!\Craft::$app->getDb()->tableExists('{{%freeform_notification_template_wrappers}}')) {
            return true;
        }

        // Drop the handle index
        $this->dropIndexIfExists(
            '{{%freeform_notification_template_wrappers}}',
            ['handle'],
            true,
        );

        // Recreate the name index
        $this->createIndex(
            'name',
            '{{%freeform_notification_template_wrappers}}',
            ['name'],
            true
        );

        return true;
    }
}
