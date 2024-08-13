<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m240813_161214_UpdateStatusColors migration.
 */
class m240813_161214_UpdateStatusColors extends Migration
{
    public function safeUp(): bool
    {
        $results = (new Query())
            ->select(['color'])
            ->from('{{%freeform_statuses}}')
            ->indexBy('id')
            ->column()
        ;

        foreach ($results as $id => $color) {
            if ('light' === $color || 'grey' === $color || 'turquoise' === $color) {
                $this->update(
                    '{{%freeform_statuses}}',
                    ['color' => 'gray'],
                    ['id' => $id],
                    [],
                    false
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240813_161214_UpdateStatusColors cannot be reverted.\n";

        return false;
    }
}
