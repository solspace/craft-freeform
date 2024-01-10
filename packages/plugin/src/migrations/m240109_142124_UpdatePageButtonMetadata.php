<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m240109_142124_UpdatePageButtonMetadata migration.
 */
class m240109_142124_UpdatePageButtonMetadata extends Migration
{
    public function safeUp(): bool
    {
        $results = (new Query())
            ->select(['metadata'])
            ->from('{{%freeform_forms_pages}}')
            ->indexBy('id')
            ->column()
        ;

        foreach ($results as $id => $metadata) {
            $metadata = json_decode($metadata, true);

            $buttons = $metadata['buttons'];

            if (isset($buttons['submitLabel'])) {
                continue;
            }

            $updatedMetadata = $metadata;
            $updatedMetadata['buttons'] = [
                'submitLabel' => $buttons['submit']['label'] ?? 'Submit',
                'back' => $buttons['back']['enabled'] ?? false,
                'backLabel' => $buttons['back']['label'] ?? 'Back',
                'save' => $buttons['save']['enabled'] ?? false,
                'saveLabel' => $buttons['save']['label'] ?? 'Save',
                'emailField' => null,
                'notificationTemplate' => null,
                'redirectUrl' => '',
            ];

            $this->update(
                '{{%freeform_forms_pages}}',
                ['metadata' => $updatedMetadata],
                ['id' => $id],
                [],
                false
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240109_142124_UpdatePageButtonMetadata cannot be reverted.\n";

        return false;
    }
}
