<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m190618_142759_AddFixedForeignKeys migration.
 */
class m190618_142759_AddFixedForeignKeys extends Migration
{
    public function safeUp(): bool
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
            ForeignKey::CASCADE
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
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            'freeform_payments_payments_subscriptionId_fk',
            '{{%freeform_payments_payments}}',
            'subscriptionId',
            '{{%freeform_payments_subscriptions}}',
            'id',
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            'freeform_payments_payments_integrationId_fk',
            '{{%freeform_payments_payments}}',
            'integrationId',
            '{{%freeform_integrations}}',
            'id',
            ForeignKey::CASCADE
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
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            'freeform_payments_subscriptions_integrationId_fk',
            '{{%freeform_payments_subscriptions}}',
            'integrationId',
            '{{%freeform_integrations}}',
            'id',
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            'freeform_payments_subscriptions_planId_fk',
            '{{%freeform_payments_subscriptions}}',
            'planId',
            '{{%freeform_payments_subscription_plans}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown(): bool
    {
        echo "m190618_142759_AddFixedForeignKeys cannot be reverted.\n";

        return false;
    }
}
