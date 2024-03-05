<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m210923_110033_AddSavedFormsTable migration.
 */
class m210923_110033_AddSavedFormsTable extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->tableExists('{{%freeform_saved_forms}}')) {
            $this->createTable(
                '{{%freeform_saved_forms}}',
                [
                    'id' => $this->primaryKey(),
                    'sessionId' => $this->string(100),
                    'formId' => $this->integer()->notNull(),
                    'token' => $this->string(100)->notNull(),
                    'payload' => $this->mediumText(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->createIndex(null, '{{%freeform_saved_forms}}', ['token']);
            $this->createIndex(null, '{{%freeform_saved_forms}}', ['dateCreated']);
            $this->createIndex(null, '{{%freeform_saved_forms}}', ['sessionId']);

            $this->addForeignKey(
                null,
                '{{%freeform_saved_forms}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $keys = $this->db->schema->getTableForeignKeys('{{%freeform_saved_forms}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_saved_forms}}');
        }

        $this->dropTableIfExists('{{%freeform_saved_forms}}');

        return true;
    }
}
