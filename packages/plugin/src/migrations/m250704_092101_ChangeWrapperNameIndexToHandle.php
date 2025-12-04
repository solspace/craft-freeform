<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250704_092101_ChangeWrapperNameIndexToHandle extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_notification_template_wrappers}}';

        if (!\Craft::$app->getDb()->tableExists($table)) {
            return true;
        }

        // Drop the old "name" index if it exists
        $this->dropIndexIfExists(
            $table,
            ['name'],
            true
        );

        // Drop any existing index on the "handle" column if it exists
        $this->dropIndexIfExists(
            $table,
            ['handle'],
            true
        );

        // Create a new unique index on "handle"
        $this->createIndex(
            'freeform_notification_template_wrappers_handle_idx',
            $table,
            ['handle'],
            true
        );

        return true;
    }

    public function safeDown(): bool
    {
        $table = '{{%freeform_notification_template_wrappers}}';

        if (!\Craft::$app->getDb()->tableExists($table)) {
            return true;
        }

        // Drop the "handle" index if it exists
        $this->dropIndexIfExists(
            $table,
            ['handle'],
            true
        );

        // Recreate the unique index on "name"
        $this->createIndex(
            'freeform_notification_template_wrappers_name_idx',
            $table,
            ['name'],
            true
        );

        return true;
    }
}
