<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;

/**
 * m180430_151626_payment_gateways migration.
 */
class m180430_151626_PaymentGateways extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->alterColumn(
            '{{%freeform_integrations}}',
            'type',
            $this->enum('type', ['mailing_list', 'crm', 'payment_gateway'])->notNull()
        );
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->alterColumn(
            '{{%freeform_integrations}}',
            'type',
            $this->enum('type', ['mailing_list', 'crm'])->notNull()
        );
    }
}
