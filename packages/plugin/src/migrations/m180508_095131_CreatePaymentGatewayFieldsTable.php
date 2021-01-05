<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m180508_095131_CreatePaymentGatewayFieldsTable migration.
 */
class m180508_095131_CreatePaymentGatewayFieldsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%freeform_payment_gateway_fields}}', [
            'id' => $this->primaryKey(),
            'integrationId' => $this->integer()->notNull(),
            'label' => $this->string(255)->notNull(),
            'handle' => $this->string(255)->notNull(),
            'type' => $this->enum('type', ['string', 'numeric', 'boolean', 'array'])->notNull(),
            'required' => $this->boolean()->defaultValue(false),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);
        $this->addForeignKey(
            null,
            '{{%freeform_payment_gateway_fields}}',
            'integrationId',
            '{{%freeform_integrations}}',
            'id',
            ForeignKey::CASCADE
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%freeform_payment_gateway_fields}}');
    }
}
