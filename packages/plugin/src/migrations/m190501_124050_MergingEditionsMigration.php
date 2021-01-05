<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Records\FieldRecord;
use yii\db\Query;

/**
 * m190501_124050_MergingEditionsMigration migration.
 */
class m190501_124050_MergingEditionsMigration extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->installProTables();
        $this->installPaymentsTables();
        $this->installPaymentsField();
        $this->convertIntegrations();
        $this->removeStalePlugins();

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190501_124050_MergingEditionsMigration cannot be reverted.\n";

        return false;
    }

    private function installProTables()
    {
        if (!$this->db->tableExists('{{%freeform_export_profiles}}')) {
            $this->createTable(
                '{{%freeform_export_profiles}}',
                [
                    'id' => $this->primaryKey(),
                    'formId' => $this->integer()->notNull(),
                    'name' => $this->string(255)->notNull()->unique(),
                    'limit' => $this->integer(),
                    'dateRange' => $this->string(255),
                    'fields' => $this->text()->notNull(),
                    'filters' => $this->text(),
                    'statuses' => $this->text()->notNull(),
                ]
            );

            $this->createTable(
                '{{%freeform_export_settings}}',
                [
                    'id' => $this->primaryKey(),
                    'userId' => $this->integer()->notNull(),
                    'setting' => $this->text(),
                ]
            );

            $this->addForeignKey(
                'freeform_export_profiles_formId_fk',
                '{{%freeform_export_profiles}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                'CASCADE'
            );

            $this->addForeignKey(
                'freeform_export_settings_userId_fk',
                '{{%freeform_export_settings}}',
                'userId',
                '{{%users}}',
                'id',
                'CASCADE'
            );
        }
    }

    private function installPaymentsTables()
    {
        if (!$this->db->tableExists('{{%freeform_payments_subscription_plans}}')) {
            $this->createTable(
                '{{%freeform_payments_subscription_plans}}',
                [
                    'id' => $this->primaryKey(),
                    'integrationId' => $this->integer()->notNull(),
                    'resourceId' => $this->string(255),
                    'name' => $this->string(255),
                    'status' => $this->string(20),
                ]
            );

            $this->createTable(
                '{{%freeform_payments_payments}}',
                [
                    'id' => $this->primaryKey(),
                    'integrationId' => $this->integer()->notNull(),
                    'submissionId' => $this->integer()->notNull(),
                    'subscriptionId' => $this->integer(),
                    'resourceId' => $this->string(50),
                    'amount' => $this->float(2),
                    'currency' => $this->string(3),
                    'last4' => $this->smallInteger(),
                    'status' => $this->string(20),
                    'metadata' => $this->mediumText(),
                    'errorCode' => $this->string(20),
                    'errorMessage' => $this->string(255),
                ]
            );

            $this->createIndex(
                'freeform_payments_payments_integrationId_resourceId_unq_idx',
                '{{%freeform_payments_payments}}',
                ['integrationId', 'resourceId'],
                true
            );

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
                    'intervalCount' => $this->smallInteger()->notNull(),
                    'last4' => $this->smallInteger(),
                    'status' => $this->string(20),
                    'metadata' => $this->mediumText(),
                    'errorCode' => $this->string(20),
                    'errorMessage' => $this->string(255),
                ]
            );

            $this->createIndex(
                'freeform_payments_subscriptions_integrationId_resourceId_unq_idx',
                '{{%freeform_payments_subscriptions}}',
                ['integrationId', 'resourceId'],
                true
            );

            // ==================
            // Subscription plans
            // ==================
            $this->addForeignKey(
                'freeform_payments_subscription_plans_integrationId_fk',
                '{{%freeform_payments_subscription_plans}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );

            // ==================
            // Payments
            // ==================
            $this->addForeignKey(
                'freeform_payments_payments_submissionId_fk',
                '{{%freeform_payments_payments}}',
                'submissionId',
                '{{%freeform_submissions}}',
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

            $this->addForeignKey(
                'freeform_payments_payments_subscriptionId_fk',
                '{{%freeform_payments_payments}}',
                'subscriptionId',
                '{{%freeform_payments_subscriptions}}',
                'id',
                'CASCADE'
            );

            // ==================
            // Subscriptions
            // ==================
            $this->addForeignKey(
                'freeform_payments_subscriptions_integrationId_fk',
                '{{%freeform_payments_subscriptions}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );

            $this->addForeignKey(
                'freeform_payments_subscriptions_submissionId_fk',
                '{{%freeform_payments_subscriptions}}',
                'submissionId',
                '{{%freeform_submissions}}',
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
        }
    }

    private function installPaymentsField()
    {
        $fieldsService = Freeform::getInstance()->fields;

        $id = (new Query())
            ->select(['id'])
            ->from(FieldRecord::TABLE)
            ->where([
                'handle' => 'payment',
                'type' => FieldInterface::TYPE_CREDIT_CARD_DETAILS,
            ])
            ->scalar()
        ;

        if (!$id) {
            $field = FieldModel::create();
            $field->handle = 'payment';
            $field->label = '';
            $field->type = FieldInterface::TYPE_CREDIT_CARD_DETAILS;
            $fieldsService->save($field);
        }
    }

    private function convertIntegrations()
    {
        $rows = (new Query())
            ->select(['id', 'class'])
            ->from('{{%freeform_integrations}}')
            ->all()
        ;

        foreach ($rows as $row) {
            $class = $newClass = $row['class'];
            if (preg_match('#Solspace\\\\Freeform(Pro|Payments)\\\\Integrations#', $class)) {
                $newClass = preg_replace(
                    '#(\\\\Freeform)(Pro|Payments)\\\\Integrations#',
                    '$1\Integrations',
                    $class
                );

                $this->update(
                    '{{%freeform_integrations}}',
                    ['class' => $newClass],
                    ['id' => $row['id']]
                );
            }
        }
    }

    private function removeStalePlugins()
    {
        $this->delete('{{%plugins}}', ['handle' => ['freeform-payments', 'freeform-pro']]);
    }
}
