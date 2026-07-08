<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250703_081352_AddHoneypotValueToSpamReasonTable extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_spam_reason}}',
            'reasonValue',
            $this->longText()->null()->after('reasonMessage')
        );

        return true;
    }

    public function safeDown(): bool
    {
        if (!$this->db->columnExists('{{%freeform_spam_reason}}', 'reasonValue')) {
            return true;
        }

        $this->dropColumn('{{%freeform_spam_reason}}', 'reasonValue');

        return true;
    }
}
