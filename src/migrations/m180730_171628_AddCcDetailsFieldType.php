<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;

/**
 * m180730_171628_AddCcDetailsFieldType migration.
 */
class m180730_171628_AddCcDetailsFieldType extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
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
                    'cc_details'
                ]
            )->notNull()
        );
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
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
    }
}
