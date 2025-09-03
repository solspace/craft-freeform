<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\RadiosField;

class RadioProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Radio' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return RadiosField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['optionConfiguration'] = [
            'source' => 'custom',
            'useCustomValues' => true,
            'options' => $this->mapFieldOptions($formField),
        ];

        // Extract default value for radio fields
        $defaultValue = $this->getRadioDefaultValue($formField);
        $metadata['defaultValue'] = $defaultValue;

        $metadata['oneLine'] = $this->shouldShowOnOneLine($formField);

        return $metadata;
    }

    /**
     * Extract default value for radio fields.
     *
     * @param mixed $formField
     */
    private function getRadioDefaultValue($formField): ?string
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

    private function shouldShowOnOneLine($formField): bool
    {
        if (property_exists($formField, 'layout') && !empty($formField->layout)) {
            return 'horizontal' === strtolower($formField->layout);
        }

        $settings = $this->getFieldSettings($formField);
        if (isset($settings['layout']) && !empty($settings['layout'])) {
            return 'horizontal' === strtolower($settings['layout']);
        }

        return false;
    }
}
