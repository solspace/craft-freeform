<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxesField;

class CheckboxesProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Checkboxes' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxesField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Options
        $metadata['optionConfiguration'] = [
            'source' => 'custom',
            'useCustomValues' => true,
            'options' => $this->mapFieldOptions($formField),
        ];

        // Default values must be an array for checkboxes
        $defaults = $this->getCheckboxesDefaultValues($formField);
        $metadata['defaultValue'] = $defaults;

        // Map optional limits if present on source field (best-effort)
        foreach (['limit', 'limitMin', 'limitMax', 'limitRange'] as $limitKey) {
            if (property_exists($formField, $limitKey) && null !== $formField->{$limitKey}) {
                $metadata[$limitKey] = $formField->{$limitKey};
            }
        }

        return $metadata;
    }

    /**
     * Extract default values for checkboxes fields.
     *
     * @param mixed $formField
     */
    private function getCheckboxesDefaultValues($formField): array
    {
        $defaults = [];

        // First try to get from base metadata (which now checks settings)
        $baseDefault = $this->getBaseMetadata($formField)['defaultValue'] ?? null;
        if (!empty($baseDefault)) {
            if (\is_array($baseDefault)) {
                $defaults = array_map(fn ($v) => (string) $v, $baseDefault);
            } elseif (\is_string($baseDefault) && '' !== $baseDefault) {
                $defaults = [(string) $baseDefault];
            }
        }

        // If no defaults found, check options with isDefault = true
        if (empty($defaults)) {
            $options = $this->mapFieldOptions($formField);
            foreach ($options as $option) {
                if (isset($option['isDefault']) && $option['isDefault']) {
                    $defaults[] = (string) $option['value'];
                }
            }
        }

        // Fallback to other methods if still no defaults
        if (empty($defaults)) {
            if (property_exists($formField, 'defaultValues') && \is_array($formField->defaultValues)) {
                $defaults = array_map(fn ($v) => (string) $v, $formField->defaultValues);
            } elseif (method_exists($formField, 'getDefaultValue')) {
                $value = $formField->getDefaultValue();
                if (\is_array($value)) {
                    $defaults = array_map(fn ($v) => (string) $v, $value);
                } elseif (\is_string($value) && '' !== $value) {
                    $defaults = [(string) $value];
                }
            }
        }

        return $defaults;
    }
}
