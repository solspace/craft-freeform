<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use yii\db\Exception;

/**
 * m190905_113428_FixIntervalCountNotNullColumn migration.
 */
class m190905_113428_FixIntervalCountNotNullColumn extends Migration
{
    public function safeUp(): bool
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

    public function safeDown(): bool
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
