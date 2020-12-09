<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190614_103420_AddMissingMetaColumnsToPaymentTables migration.
 */
class m190614_103420_AddMissingMetaColumnsToProAndPaymentTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $tables = [
            'freeform_export_profiles',
            'freeform_export_settings',
            'freeform_payments_subscription_plans',
            'freeform_payments_payments',
            'freeform_payments_subscriptions',
        ];

        foreach ($tables as $table) {
            try {
                if (!$this->db->columnExists("{{%{$table}}}", 'dateCreated')) {
                    $this->addColumn("{{%{$table}}}", 'dateCreated', $this->dateTime());
                }

                if (!$this->db->columnExists("{{%{$table}}}", 'dateUpdated')) {
                    $this->addColumn("{{%{$table}}}", 'dateUpdated', $this->dateTime());
                }

                if (!$this->db->columnExists("{{%{$table}}}", 'uid')) {
                    $this->addColumn("{{%{$table}}}", 'uid', $this->uid());
                }
            } catch (\Exception $e) {
            }
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190614_103420_AddMissingMetaColumnsToPaymentTables cannot be reverted.\n";

        return false;
    }
}
