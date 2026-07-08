<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Form\Types\Regular;

class m211227_140312_AddFormTypes extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists('{{%freeform_forms}}', 'type')) {
            $this->addColumn('{{%freeform_forms}}', 'type', $this->string(200));
            $this->update('{{%freeform_forms}}', ['type' => Regular::class]);
            $this->alterColumn('{{%freeform_forms}}', 'type', $this->string(200)->notNull());

            $this->addColumn('{{%freeform_forms}}', 'metadata', $this->mediumText());
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists('{{%freeform_forms}}', 'type')) {
            $this->dropColumn('{{%freeform_forms}}', 'type');
            $this->dropColumn('{{%freeform_forms}}', 'metadata');
        }

        return true;
    }
}
