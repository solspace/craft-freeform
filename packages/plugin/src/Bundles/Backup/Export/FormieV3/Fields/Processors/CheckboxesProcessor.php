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
        $defaults = [];
        if (property_exists($formField, 'defaultValue')) {
            $value = $formField->defaultValue;
            if (\is_array($value)) {
                $defaults = array_map(fn ($v) => (string) $v, $value);
            } elseif (\is_string($value) && '' !== $value) {
                $defaults = [(string) $value];
            }
        } elseif (property_exists($formField, 'defaultValues') && \is_array($formField->defaultValues)) {
            $defaults = array_map(fn ($v) => (string) $v, $formField->defaultValues);
        } elseif (method_exists($formField, 'getDefaultValue')) {
            $value = $formField->getDefaultValue();
            if (\is_array($value)) {
                $defaults = array_map(fn ($v) => (string) $v, $value);
            } elseif (\is_string($value) && '' !== $value) {
                $defaults = [(string) $value];
            }
        }
        $metadata['defaultValue'] = $defaults;

        // Map optional limits if present on source field (best-effort)
        foreach (['limit', 'limitMin', 'limitMax', 'limitRange'] as $limitKey) {
            if (property_exists($formField, $limitKey) && null !== $formField->{$limitKey}) {
                $metadata[$limitKey] = $formField->{$limitKey};
            }
        }

        return $metadata;
    }
}
