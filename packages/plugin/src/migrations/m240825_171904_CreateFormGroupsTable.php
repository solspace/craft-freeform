<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240825_171904_CreateFormGroupsTable migration.
 */
class m240825_171904_CreateFormGroupsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_form_groups}}',
            [
                'id' => $this->primaryKey(),
                'site' => $this->string(),
                'groups' => $this->longText()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240825_171904_CreateFormGroupsTable cannot be reverted.\n";

        return false;
    }
}
