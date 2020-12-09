<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use yii\db\Exception;

/**
 * m190905_113428_FixIntervalCountNotNullColumn migration.
 */
class m190905_113428_FixIntervalCountNotNullColumn extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        try {
            $this->alterColumn(
                '{{%freeform_payments_subscriptions}}',
                'intervalCount',
                $this->smallInteger()->null()
            );
        } catch (Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        try {
            $this->alterColumn(
                '{{%freeform_payments_subscriptions}}',
                'intervalCount',
                $this->smallInteger()->notNull()
            );
        } catch (Exception $e) {
        }

        return true;
    }
}
