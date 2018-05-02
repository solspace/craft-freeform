<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;

/**
 * m180417_134527_AddMultipleSelectTypeToFields migration.
 */
class m180417_134527_AddMultipleSelectTypeToFields extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $this->alterColumn(
            '{{%freeform_fields}}',
            'type',
            $this->enum(
                'type',
                [
                    'text',
                    'textarea',
                    'email',
                    'hidden',
                    'select',
                    'multiple_select',
                    'checkbox',
                    'checkbox_group',
                    'radio_group',
                    'file',
                    'dynamic_recipients',
                    'datetime',
                    'number',
                    'phone',
                    'website',
                    'rating',
                    'regex',
                    'confirmation',
                ]
            )->notNull()
        );

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        $this->alterColumn(
            '{{%freeform_fields}}',
            'type',
            $this->enum(
                'type',
                [
                    'text',
                    'textarea',
                    'email',
                    'hidden',
                    'select',
                    'checkbox',
                    'checkbox_group',
                    'radio_group',
                    'file',
                    'dynamic_recipients',
                    'datetime',
                    'number',
                    'phone',
                    'website',
                    'rating',
                    'regex',
                    'confirmation',
                ]
            )->notNull()
        );

        return true;
    }
}
