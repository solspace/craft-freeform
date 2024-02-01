<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;

/**
 * m240201_162557_ConvertFieldHandleThatStartWithNumericValue migration.
 */
class m240201_162557_ConvertFieldHandleThatStartWithNumericValue extends Migration
{
    public function safeUp(): bool
    {
        $fields = (new Query())
            ->select(['id', 'metadata'])
            ->from('{{%freeform_forms_fields}}')
            ->indexBy('id')
            ->all()
        ;

        foreach ($fields as $id => $field) {
            $metadata = json_decode($field['metadata']);

            if (is_numeric($metadata->handle[0])) {
                $metadata->handle = StringHelper::toHandle($metadata->label);

                $this->update(
                    '{{%freeform_forms_fields}}',
                    ['metadata' => json_encode($metadata)],
                    ['id' => $id]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240201_162557_ConvertFieldHandleThatStartWithNumericValue cannot be reverted.\n";

        return false;
    }
}
