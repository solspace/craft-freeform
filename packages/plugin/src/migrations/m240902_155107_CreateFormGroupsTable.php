<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m240902_155107_CreateFormGroupsTable migration.
 */
class m240902_155107_CreateFormGroupsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_form_groups}}',
            [
                'id' => $this->primaryKey(),
                'siteId' => $this->integer()->notNull(),
                'label' => $this->string(),
                'order' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_form_groups}}',
            'siteId',
            '{{%sites}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240902_155107_CreateFormGroupsTable cannot be reverted.\n";

        return false;
    }
}
