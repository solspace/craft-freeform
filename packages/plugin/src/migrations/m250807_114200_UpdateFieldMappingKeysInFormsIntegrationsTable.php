<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\Json;

class m250807_114200_UpdateFieldMappingKeysInFormsIntegrationsTable extends Migration
{
    public function safeUp(): bool
    {
        // Get all rows from the integrations table
        $rows = (new Query())
            ->select(['id', 'metadata'])
            ->from('{{%freeform_forms_integrations}}')
            ->all()
        ;

        foreach ($rows as $row) {
            $metadata = Json::decode($row['metadata']);
            if (!$metadata || empty($metadata['fieldMapping'])) {
                continue;
            }

            $newFieldMapping = [];
            foreach ($metadata['fieldMapping'] as $fieldId => $mapping) {
                // Only convert numeric keys (old structure)
                if (is_numeric($fieldId)) {
                    // Get the field handle from craft_fields
                    $handle = (new Query())
                        ->select(['handle'])
                        ->from('{{%fields}}')
                        ->where(['id' => (int) $fieldId])
                        ->scalar()
                    ;

                    if ($handle) {
                        $newFieldMapping[$handle] = $mapping;
                    } else {
                        // Optionally: handle missing fields/log a warning
                        $newFieldMapping[$fieldId] = $mapping;
                    }
                } else {
                    // Already a handle, keep as is
                    $newFieldMapping[$fieldId] = $mapping;
                }
            }

            $metadata['fieldMapping'] = $newFieldMapping;

            // Save updated metadata back to the database
            $this->update(
                '{{%freeform_forms_integrations}}',
                ['metadata' => Json::encode($metadata)],
                ['id' => $row['id']]
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m250807_114200_UpdateFieldMappingKeysInFormsIntegrationsTable cannot be reverted.\n";

        return false;
    }
}
