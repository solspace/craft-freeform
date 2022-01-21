<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

class m220121_091429_AddUserIdToSubmissions extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists('{{%freeform_submissions}}', 'userId')) {
            $this->addColumn('{{%freeform_submissions}}', 'userId', $this->integer());
            $this->addForeignKey(
                null,
                '{{%freeform_submissions}}',
                'userId',
                '{{%users}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists('{{%freeform_submissions}}', 'userId')) {
            $keys = $this->db->schema->getTableForeignKeys('{{%freeform_saved_forms}}');
            foreach ($keys as $key) {
                if (1 === \count($key->columnNames) && 'userId' === $key->columnNames[0]) {
                    $this->dropForeignKey($key->name, '{{%freeform_saved_forms}}');
                }
            }

            $this->dropColumn('{{%freeform_submissions}}', 'userId');
        }

        return true;
    }
}
