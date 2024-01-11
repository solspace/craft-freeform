<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m240110_111258_ChangeFormFieldRowForeignKey extends Migration
{
    public function safeUp(): bool
    {
        $table = $this->db->getTableSchema('{{%freeform_forms_fields}}', true);
        foreach ($table->foreignKeys as $key => $foreignKey) {
            if (!str_contains($foreignKey[0], 'freeform_forms_rows')) {
                continue;
            }

            if (!isset($foreignKey['rowId']) || 'id' !== $foreignKey['rowId']) {
                continue;
            }

            $this->dropForeignKey($key, '{{%freeform_forms_fields}}');

            $this->alterColumn(
                '{{%freeform_forms_fields}}',
                'rowId',
                $this->integer()->null()
            );

            $this->addForeignKey(
                null,
                '{{%freeform_forms_fields}}',
                'rowId',
                '{{%freeform_forms_rows}}',
                'id',
                'SET NULL'
            );

            break;
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240110_111258_ChangeFormFieldRowForeignKey cannot be reverted.\n";

        return false;
    }
}
