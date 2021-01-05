<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190617_122427_FixIncorrectForeignKeyNameOnExportSettings migration.
 */
class m190617_122427_RemoveBrokenForeignKeys extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $schema = $this->db->schema;

        // =========================
        // Export settings table
        // =========================

        $keys = $schema->getTableForeignKeys('{{%freeform_export_settings}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_export_settings}}');
        }

        $indexes = $schema->getTableIndexes('{{%freeform_export_settings}}');
        foreach ($indexes as $index) {
            if (preg_match('/_fk$/', $index->name)) {
                $this->dropIndex($index->name, '{{%freeform_export_settings}}');
            }
        }

        // =========================
        // Payments table
        // =========================

        $keys = $schema->getTableForeignKeys('{{%freeform_payments_payments}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_payments_payments}}');
        }

        $indexes = $schema->getTableIndexes('{{%freeform_payments_payments}}');
        foreach ($indexes as $index) {
            if (preg_match('/_fk$/', $index->name)) {
                $this->dropIndex($index->name, '{{%freeform_payments_payments}}');
            }
        }

        // =========================
        // Subscriptions table
        // =========================

        $keys = $schema->getTableForeignKeys('{{%freeform_payments_subscriptions}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_payments_subscriptions}}');
        }

        $indexes = $schema->getTableIndexes('{{%freeform_payments_subscriptions}}');
        foreach ($indexes as $index) {
            if (preg_match('/_fk$/', $index->name)) {
                $this->dropIndex($index->name, '{{%freeform_payments_subscriptions}}');
            }
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190617_122427_FixIncorrectForeignKeyNameOnExportSettings cannot be reverted.\n";

        return false;
    }
}
