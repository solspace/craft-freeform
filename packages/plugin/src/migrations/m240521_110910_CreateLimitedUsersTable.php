<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240521_110910_CreateLimitedUsersTable migration.
 */
class m240521_110910_CreateLimitedUsersTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable('{{%freeform_limited_users}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
            'settings' => $this->longText()->notNull(),
            'dateCreated' => $this->dateTime()->notNull(),
            'dateUpdated' => $this->dateTime()->notNull(),
            'uid' => $this->uid(),
        ]);

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_limited_users}}');

        return true;
    }
}
