<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190618_142759_AddFixedForeignKeys migration.
 */
class m190618_142759_AddFixedForeignKeys extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // =========================
        // Export settings table
        // =========================
        $this->addForeignKey(
            'freeform_export_settings_userId_fk',
            '{{%freeform_export_settings}}',
            'userId',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        // =========================
        // Payments table
        // =========================

        $this->addForeignKey(
            'freeform_payments_payments_submissionId_fk',
            '{{%freeform_payments_payments}}',
            'submissionId',
            '{{%freeform_submissions}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'freeform_payments_payments_subscriptionId_fk',
            '{{%freeform_payments_payments}}',
            'subscriptionId',
            '{{%freeform_payments_subscriptions}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'freeform_payments_payments_integrationId_fk',
            '{{%freeform_payments_payments}}',
            'integrationId',
            '{{%freeform_integrations}}',
            'id',
            'CASCADE'
        );

        // =========================
        // Subscriptions table
        // =========================

        $this->addForeignKey(
            'freeform_payments_subscriptions_submissionId_fk',
            '{{%freeform_payments_subscriptions}}',
            'submissionId',
            '{{%freeform_submissions}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'freeform_payments_subscriptions_integrationId_fk',
            '{{%freeform_payments_subscriptions}}',
            'integrationId',
            '{{%freeform_integrations}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'freeform_payments_subscriptions_planId_fk',
            '{{%freeform_payments_subscriptions}}',
            'planId',
            '{{%freeform_payments_subscription_plans}}',
            'id',
            'CASCADE'
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190618_142759_AddFixedForeignKeys cannot be reverted.\n";

        return false;
    }
}
