<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Library\Helpers\StringHelper;

/**
 * m240201_151518_ConvertFormHandleDashesToCamelCase migration.
 */
class m240201_151518_ConvertFormHandleDashesToCamelCase extends Migration
{
    public function safeUp(): bool
    {
        $forms = (new Query())
            ->select(['id', 'handle', 'metadata'])
            ->from('{{%freeform_forms}}')
            ->indexBy('id')
            ->all()
        ;

        foreach ($forms as $id => $form) {
            if (str_contains($form['handle'], '-')) {
                $this->update(
                    '{{%freeform_forms}}',
                    ['handle' => StringHelper::dashesToCamelCase($form['handle'])],
                    ['id' => $id]
                );
            }

            $metadata = json_decode($form['metadata']);

            if (str_contains($metadata->general->handle, '-')) {
                $metadata->general->handle = StringHelper::dashesToCamelCase($metadata->general->handle);

                $this->update(
                    '{{%freeform_forms}}',
                    ['metadata' => json_encode($metadata)],
                    ['id' => $id]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240201_151518_ConvertFormHandleDashesToCamelCase cannot be reverted.\n";

        return false;
    }
}
