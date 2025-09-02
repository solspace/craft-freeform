<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\DropdownField;

class DropdownProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Dropdown' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DropdownField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['optionConfiguration'] = [
            'source' => 'custom',
            'useCustomValues' => true,
            'options' => $this->mapFieldOptions($formField),
        ];

        // Extract default value for dropdown fields
        $defaultValue = $this->getDropdownDefaultValue($formField);
        $metadata['defaultValue'] = $defaultValue;

        return $metadata;
    }

    /**
     * Extract default value for dropdown fields.
     *
     * @param mixed $formField
     */
    private function getDropdownDefaultValue($formField): ?string
    {
        // First try to get from base metadata (which now checks settings)
        $baseDefault = $this->getBaseMetadata($formField)['defaultValue'] ?? null;
        if (!empty($baseDefault)) {
            return (string) $baseDefault;
        }

        // Check if any options have isDefault = true
        $options = $this->mapFieldOptions($formField);
        foreach ($options as $option) {
            if (isset($option['isDefault']) && $option['isDefault']) {
                return (string) $option['value'];
            }
        }

        return null;
    }
}
