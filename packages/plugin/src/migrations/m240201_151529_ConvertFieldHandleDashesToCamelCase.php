<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Library\Helpers\StringHelper;

/**
 * m240201_151529_ConvertFieldHandleDashesToCamelCase migration.
 */
class m240201_151529_ConvertFieldHandleDashesToCamelCase extends Migration
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

            if (str_contains($metadata->handle, '-')) {
                $metadata->handle = StringHelper::dashesToCamelCase($metadata->handle);

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
        echo "m240201_151529_ConvertFieldHandleDashesToCamelCase cannot be reverted.\n";

        return false;
    }
}
