<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250513_104454_AddEmailWrapperTable extends Migration
{
    public function safeUp(): bool
    {
        if (\Craft::$app->getDb()->tableExists('{{%freeform_notification_template_wrappers}}')) {
            return true;
        }

        $this->createTable(
            '{{%freeform_notification_template_wrappers}}',
            [
                'id' => $this->primaryKey(),
                'name' => $this->string()->notNull(),
                'handle' => $this->string()->notNull(),
                'description' => $this->text(),
                'content' => $this->longText()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(
            'idx-freeform_notification_template_wrappers-name',
            '{{%freeform_notification_template_wrappers}}',
            ['name'],
            true
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_notification_template_wrappers}}');

        return true;
    }
}
