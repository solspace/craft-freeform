<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m200203_180318_AddSpamReasonTable migration.
 */
class m200203_180318_AddSpamReasonTable extends Migration
{
    public const TARGET_TABLE = '{{%freeform_spam_reason}}';

    public function safeUp()
    {
        if (!$this->db->tableExists(self::TARGET_TABLE)) {
            $this->createTable(
                self::TARGET_TABLE,
                [
                    'id' => $this->primaryKey(),
                    'submissionId' => $this->integer()->notNull(),
                    'reasonType' => $this->string(100)->notNull(),
                    'reasonMessage' => $this->text(),
                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->createIndex(null, self::TARGET_TABLE, ['submissionId', 'reasonType'], false);
            $this->addForeignKey(
                'freeform_spam_reason_submissionId_fk',
                self::TARGET_TABLE,
                'submissionId',
                '{{%freeform_submissions}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        return true;
    }

    public function safeDown()
    {
        $keys = $this->db->schema->getTableForeignKeys(self::TARGET_TABLE);
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, self::TARGET_TABLE);
        }

        $this->dropTableIfExists(self::TARGET_TABLE);

        return false;
    }
}
