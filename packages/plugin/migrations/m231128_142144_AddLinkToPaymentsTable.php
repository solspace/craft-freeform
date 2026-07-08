<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m231128_142144_AddLinkToPaymentsTable migration.
 */
class m231128_142144_AddLinkToPaymentsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->alterColumn(
            '{{%freeform_payments}}',
            'status',
            $this->string(40)
        );

        $this->addColumn(
            '{{%freeform_payments}}',
            'link',
            $this->string(255)->null()->after('status')
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->alterColumn(
            '{{%freeform_payments}}',
            'status',
            $this->string(20)
        );

        $this->dropColumn('{{%freeform_payments}}', 'link');

        return true;
    }
}
