<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m180430_151626_payment_gateways migration.
 */
class m180430_151626_PaymentGateways extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[type]] SET NOT NULL');
        } else {
            $this->alterColumn(
                '{{%freeform_integrations}}',
                'type',
                $this->string(50)->notNull()
            );
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        return true;
    }
}
