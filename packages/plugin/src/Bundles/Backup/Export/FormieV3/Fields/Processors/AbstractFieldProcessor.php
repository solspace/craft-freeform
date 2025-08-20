<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Interfaces\FieldProcessorInterface;
use Solspace\Freeform\Library\Helpers\HashHelper;

abstract class AbstractFieldProcessor implements FieldProcessorInterface
{
    public function process($formField, string $formUid, int $index): ?Field
    {
        $field = new Field();
        $field->name = $formField->label ?? 'Field '.($index + 1);
        $handle = $this->getFieldHandle($formField->handle ?? 'field'.$index);
        $field->handle = $handle;
        $field->type = $this->getFreeformFieldClass();
        $field->required = $formField->required ?? false;
        // Stabilize UID generation: prefer source UID; otherwise derive from form UID + handle + type
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'_'.$handle.'_'.$field->type, 32);
        $field->metadata = $this->getFieldMetadata($formField);

        return $field;
    }

    protected function getFieldHandle($currentHandle): string
    {
        $newHandle = $currentHandle;

        // Remove any dashes
        if (str_contains($newHandle, '-')) {
            $newHandle = str_replace('-', '_', $newHandle);
        }

        // Ensure handle is valid
        if (empty($newHandle)) {
            $newHandle = 'field_'.uniqid();
        }

        return $newHandle;
    }

    protected function getBaseMetadata($formField): array
    {
        $metadata = [
            'label' => $formField->label ?? '',
            'handle' => $this->getFieldHandle($formField->handle ?? ''),
            'instructions' => $formField->instructions ?? '',
            'required' => $formField->required ?? false,
        ];

        // Try to get placeholder and defaultValue from direct properties first
        $placeholder = $formField->placeholder ?? null;
        $defaultValue = $formField->defaultValue ?? null;

        // If not found directly, try to get from settings
        if (empty($placeholder) || empty($defaultValue)) {
            $settings = $this->getFieldSettings($formField);

            if (empty($placeholder) && isset($settings['placeholder'])) {
                $placeholder = $settings['placeholder'];
            }

            if (empty($defaultValue) && isset($settings['defaultValue'])) {
                $defaultValue = $settings['defaultValue'];
            }
        }

        $metadata['placeholder'] = $placeholder ?? '';
        $metadata['defaultValue'] = $defaultValue ?? '';

        return $metadata;
    }

    /**
     * Extract settings from Formie field.
     *
     * @param mixed $formField
     */
    protected function getFieldSettings($formField): array
    {
        $settings = [];

        // Try to get settings from the field object
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            $settings = (array) $formField->settings;
        }

        // If no settings found, try to get from getSettings method
        if (empty($settings) && method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings() ?? [];
        }

        return $settings;
    }

    /**
     * Default implementation for mapping field options.
     * Can be overridden by individual processors for custom logic.
     *
     * @param mixed $field
     */
    protected function mapFieldOptions($field): array
    {
        $options = [];

        // First, try to get options directly from the field object
        if (property_exists($field, 'options') && \is_array($field->options)) {
            foreach ($field->options as $option) {
                $options[] = [
                    'label' => $option['label'] ?? '',
                    'value' => $option['value'] ?? '',
                ];
            }
        }

        // If no options found directly, try getSettings method
        if (empty($options) && method_exists($field, 'getSettings')) {
            $settings = $field->getSettings();

            if (isset($settings['options']) && \is_array($settings['options'])) {
                foreach ($settings['options'] as $option) {
                    $options[] = [
                        'label' => $option['label'] ?? '',
                        'value' => $option['value'] ?? '',
                    ];
                }
            }
        }

        // Fallback to getOptions method if it exists
        if (empty($options) && method_exists($field, 'getOptions')) {
            foreach ($field->getOptions() as $option) {
                $options[] = [
                    'label' => $option['label'] ?? '',
                    'value' => $option['value'] ?? '',
                ];
            }
        }

        return $options;
    }
}
