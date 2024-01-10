<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m231230_074448_CreateFieldsTypeGroupsTable migration.
 */
class m231230_074448_CreateFieldsTypeGroupsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_fields_type_groups}}',
            [
                'id' => $this->primaryKey(),
                'color' => $this->string(10),
                'label' => $this->string(),
                'types' => $this->json()->notNull(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m231230_074448_CreateFieldsTypeGroupsTable cannot be reverted.\n";

        return false;
    }
}
