<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m240902_155119_CreateFormGroupsEntriesTable migration.
 */
class m240902_155119_CreateFormGroupsEntriesTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_form_groups_entries}}',
            [
                'id' => $this->primaryKey(),
                'groupId' => $this->integer()->notNull(),
                'formId' => $this->integer()->notNull(),
                'order' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_form_groups_entries}}',
            'groupId',
            '{{%freeform_form_groups}}',
            'id',
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            null,
            '{{%freeform_form_groups_entries}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240902_155119_CreateFormGroupsEntriesTable cannot be reverted.\n";

        return false;
    }
}
