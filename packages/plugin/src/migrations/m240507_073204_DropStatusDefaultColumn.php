<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m240507_073204_DropStatusDefaultColumn extends Migration
{
    public function safeUp(): bool
    {
        $this->dropColumn('{{%freeform_statuses}}', 'isDefault');

        return true;
    }

    public function safeDown(): bool
    {
        $this->addColumn('{{%freeform_statuses}}', 'isDefault', $this->boolean()->defaultValue(false));

        return true;
    }
}
