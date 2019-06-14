<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190614_103420_AddMissingMetaColumnsToPaymentTables migration.
 */
class m190614_103420_AddMissingMetaColumnsToProAndPaymentTables extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        try {
            $this->addColumn('{{%freeform_export_profiles}}', 'dateCreated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_export_profiles}}', 'dateUpdated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_export_profiles}}', 'uid', $this->uid());
        } catch (\Exception $e) {
        }

        try {
            $this->addColumn('{{%freeform_export_settings}}', 'dateCreated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_export_settings}}', 'dateUpdated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_export_settings}}', 'uid', $this->uid());
        } catch (\Exception $e) {
        }

        try {
            $this->addColumn('{{%freeform_payments_subscription_plans}}', 'dateCreated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_subscription_plans}}', 'dateUpdated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_subscription_plans}}', 'uid', $this->uid());
        } catch (\Exception $e) {
        }

        try {
            $this->addColumn('{{%freeform_payments_payments}}', 'dateCreated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_payments}}', 'dateUpdated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_payments}}', 'uid', $this->uid());
        } catch (\Exception $e) {
        }

        try {
            $this->addColumn('{{%freeform_payments_subscriptions}}', 'dateCreated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_subscriptions}}', 'dateUpdated', $this->dateTime()->notNull());
            $this->addColumn('{{%freeform_payments_subscriptions}}', 'uid', $this->uid());
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m190614_103420_AddMissingMetaColumnsToPaymentTables cannot be reverted.\n";

        return false;
    }
}
