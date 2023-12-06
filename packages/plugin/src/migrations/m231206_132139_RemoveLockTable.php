<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m231206_132139_RemoveLockTable extends Migration
{
    public function safeUp(): bool
    {
        $this->dropTableIfExists('{{%freeform_lock}}');

        return true;
    }

    public function safeDown(): bool
    {
        $this->createTable(
            '{{%freeform_lock}}',
            [
                'id' => $this->primaryKey(),
                'key' => $this->string()->notNull(),
            ],
        );

        $this->createIndex(null, '{{%freeform_lock}}', ['key', 'dateCreated'], true);
        $this->createIndex(null, '{{%freeform_lock}}', ['dateCreated']);

        return true;
    }
}
