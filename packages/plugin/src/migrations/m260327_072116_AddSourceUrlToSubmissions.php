<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m260327_072116_AddSourceUrlToSubmissions extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists('{{%freeform_submissions}}', 'sourceUrl')) {
            $this->addColumn(
                '{{%freeform_submissions}}',
                'sourceUrl',
                $this->text()->null()
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists('{{%freeform_submissions}}', 'sourceUrl')) {
            $this->dropColumn('{{%freeform_submissions}}', 'sourceUrl');
        }

        return true;
    }
}
