<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxField;

class CheckboxProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Checkbox' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // For checkbox fields, we need to check both direct defaultValue and options with isDefault
        $defaultValue = $this->getCheckboxDefaultValue($formField);
        $metadata['defaultValue'] = $defaultValue;

        return $metadata;
    }

    /**
     * Extract default value for checkbox fields.
     *
     * @param mixed $formField
     */
    private function getCheckboxDefaultValue($formField): bool
    {
        // First try to get from base metadata (which now checks settings)
        $baseDefault = $this->getBaseMetadata($formField)['defaultValue'] ?? false;
        if (!empty($baseDefault)) {
            return (bool) $baseDefault;
        }

        // Check if any options have isDefault = true
        $options = $this->mapFieldOptions($formField);
        foreach ($options as $option) {
            if (isset($option['isDefault']) && $option['isDefault']) {
                return true;
            }
        }

        return false;
    }
}
