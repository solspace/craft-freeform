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
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'field'.$index, 32);
        $field->name = $formField->label ?? 'Field '.($index + 1);
        $field->handle = $this->getFieldHandle($formField->handle ?? 'field'.$index);
        $field->type = $this->getFreeformFieldClass();
        $field->required = $formField->required ?? false;
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
        return [
            'label' => $formField->label ?? '',
            'handle' => $this->getFieldHandle($formField->handle ?? ''),
            'instructions' => $formField->instructions ?? '',
            'required' => $formField->required ?? false,
            'placeholder' => $formField->placeholder ?? '',
            'defaultValue' => $formField->defaultValue ?? '',
        ];
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
