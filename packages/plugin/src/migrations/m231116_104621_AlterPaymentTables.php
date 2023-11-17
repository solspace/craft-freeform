<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m231116_104621_AlterPaymentTables extends Migration
{
    public function safeUp(): bool
    {
        $this->dropAllForeignKeysToTable('{{%freeform_payments_payments}}');
        $this->dropAllForeignKeysToTable('{{%freeform_payments_subscription_plans}}');
        $this->dropAllForeignKeysToTable('{{%freeform_payments_subscriptions}}');
        $this->dropAllForeignKeysToTable('{{%freeform_payment_gateway_fields}}');

        $this->dropTableIfExists('{{%freeform_payments_payments}}');
        $this->dropTableIfExists('{{%freeform_payments_subscription_plans}}');
        $this->dropTableIfExists('{{%freeform_payments_subscriptions}}');
        $this->dropTableIfExists('{{%freeform_payment_gateway_fields}}');

        $this->createTable(
            '{{%freeform_payments}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'fieldId' => $this->integer()->notNull(),
                'submissionId' => $this->integer()->notNull(),
                'resourceId' => $this->string(50),
                'type' => $this->string(20),
                'amount' => $this->float(2),
                'currency' => $this->string(3),
                'status' => $this->string(20),
                'metadata' => $this->mediumText(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments}}',
            ['submissionId'],
            '{{%freeform_submissions}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments}}',
            ['fieldId'],
            '{{%freeform_forms_fields}}',
            ['id'],
            'CASCADE'
        );

        $this->createIndex(
            null,
            '{{%freeform_payments}}',
            ['integrationId', 'resourceId'],
            true
        );

        $this->createIndex(
            null,
            '{{%freeform_payments}}',
            ['integrationId', 'type']
        );

        $this->createIndex(
            null,
            '{{%freeform_payments}}',
            ['resourceId']
        );

        return true;
    }

    public function safeDown(): bool
    {
        // Drop the new freeform_payments table
        $this->dropTableIfExists('{{%freeform_payments}}');

        // Recreate the freeform_payments_subscription_plans table
        $this->createTable(
            '{{%freeform_payments_subscription_plans}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'resourceId' => $this->string(255),
                'name' => $this->string(255),
                'status' => $this->string(20),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        // Recreate the freeform_payments_payments table
        $this->createTable(
            '{{%freeform_payments_payments}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'submissionId' => $this->integer()->notNull(),
                'subscriptionId' => $this->integer()->notNull(),
                'resourceId' => $this->string(50),
                'amount' => $this->float(2),
                'currency' => $this->string(3),
                'last4' => $this->smallInteger(),
                'status' => $this->string(20),
                'metadata' => $this->mediumText(),
                'errorCode' => $this->string(20),
                'errorMessage' => $this->string(255),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        // Recreate the freeform_payments_subscriptions table
        $this->createTable(
            '{{%freeform_payments_subscriptions}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'submissionId' => $this->integer()->notNull(),
                'planId' => $this->integer()->notNull(),
                'resourceId' => $this->string(50),
                'amount' => $this->float(2),
                'currency' => $this->string(3),
                'interval' => $this->string(20),
                'intervalCount' => $this->integer()->null(),
                'last4' => $this->smallInteger(),
                'status' => $this->string(20),
                'metadata' => $this->mediumText(),
                'errorCode' => $this->string(20),
                'errorMessage' => $this->string(255),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments_subscription_plans}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            'CASCADE'
        );

        // Add the foreign keys and indexes back to the freeform_payments_payments table
        $this->addForeignKey(
            null,
            '{{%freeform_payments_payments}}',
            ['submissionId'],
            '{{%freeform_submissions}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments_payments}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments_payments}}',
            ['subscriptionId'],
            '{{%freeform_payments_subscriptions}}',
            ['id'],
            'CASCADE'
        );

        $this->createIndex(
            null,
            '{{%freeform_payments_payments}}',
            ['integrationId', 'resourceId'],
            true
        );

        // Add the foreign keys and indexes back to the freeform_payments_subscriptions table
        $this->addForeignKey(
            null,
            '{{%freeform_payments_subscriptions}}',
            ['submissionId'],
            '{{%freeform_submissions}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments_subscriptions}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payments_subscriptions}}',
            ['planId'],
            '{{%freeform_payments_subscription_plans}}',
            ['id'],
            'CASCADE'
        );

        $this->createIndex(
            null,
            '{{%freeform_payments_subscriptions}}',
            ['integrationId', 'resourceId'],
            true
        );

        $this->createTable(
            '{{%freeform_payment_gateway_fields}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'label' => $this->string(255)->notNull(),
                'handle' => $this->string(255)->notNull(),
                'type' => $this->string(50)->notNull(),
                'required' => $this->boolean()->defaultValue(false),
            ]
        );

        $this->createIndex(
            null,
            '{{%freeform_payment_gateway_fields}}',
            ['type']
        );

        $this->addForeignKey(
            null,
            '{{%freeform_payment_gateway_fields}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            'CASCADE'
        );

        return true;
    }
}
