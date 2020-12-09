<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m181129_083939_ChangeCrmFieldTypeColumnTypeToString migration.
 */
class m181129_083939_ChangeIntegrationFieldTypeColumnTypeToString extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_crm_fields}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_crm_fields}} ALTER COLUMN [[type]] SET NOT NULL');
            $this->execute('ALTER TABLE {{%freeform_mailing_list_fields}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_mailing_list_fields}} ALTER COLUMN [[type]] SET NOT NULL');
            $this->execute('ALTER TABLE {{%freeform_payment_gateway_fields}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_payment_gateway_fields}} ALTER COLUMN [[type]] SET NOT NULL');

            // Attempt to remove constraints automatically
            try {
                $prefix = $this->db->tablePrefix ?: '';

                $this->execute('ALTER TABLE {{%freeform_crm_fields}} DROP CONSTRAINT '.$prefix.'freeform_crm_fields_type_check;');
                $this->execute('ALTER TABLE {{%freeform_mailing_list_fields}} DROP CONSTRAINT '.$prefix.'freeform_mailing_list_fields_type_check;');
                $this->execute('ALTER TABLE {{%freeform_payment_gateway_fields}} DROP CONSTRAINT '.$prefix.'freeform_payment_gateway_fields_type_check;');
            } catch (\Exception $e) {
            }
        } else {
            $this->alterColumn('{{%freeform_crm_fields}}', 'type', $this->string(50)->notNull());
            $this->alterColumn('{{%freeform_mailing_list_fields}}', 'type', $this->string(50)->notNull());
            $this->alterColumn('{{%freeform_payment_gateway_fields}}', 'type', $this->string(50)->notNull());
        }

        $this->createIndex(null, '{{%freeform_crm_fields}}', 'type');
        $this->createIndex(null, '{{%freeform_mailing_list_fields}}', 'type');
        $this->createIndex(null, '{{%freeform_payment_gateway_fields}}', 'type');

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181129_083939_ChangeCrmFieldTypeColumnTypeToString cannot be reverted.\n";

        return false;
    }
}
