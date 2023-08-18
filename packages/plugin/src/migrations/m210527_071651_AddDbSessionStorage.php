<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m210527_071651_AddDbSessionStorage migration.
 */
class m210527_071651_AddDbSessionStorage extends Migration
{
    public function safeUp()
    {
        if (!$this->db->tableExists('{{%freeform_session_context}}')) {
            $this->createTable(
                '{{%freeform_session_context}}',
                [
                    'id' => $this->primaryKey(),
                    'contextKey' => $this->string(100)->notNull(),
                    'sessionId' => $this->string(100)->notNull(),
                    'formId' => $this->integer()->notNull(),
                    'propertyBag' => $this->mediumText(),
                    'attributeBag' => $this->mediumText(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->createIndex(null, '{{%freeform_session_context}}', ['contextKey', 'formId']);
            $this->createIndex(null, '{{%freeform_session_context}}', ['sessionId']);

            $this->addForeignKey(
                null,
                '{{%freeform_session_context}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        return true;
    }

    public function safeDown()
    {
        $keys = $this->db->schema->getTableForeignKeys('{{%freeform_session_context}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_session_context}}');
        }

        $this->dropTableIfExists('{{%freeform_session_context}}');

        return true;
    }
}
