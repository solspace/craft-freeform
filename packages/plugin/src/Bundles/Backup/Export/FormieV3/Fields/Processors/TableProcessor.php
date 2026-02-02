<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use verbb\formie\fields\Table as FormieTable;

class TableProcessor extends AbstractFieldProcessor
{
    public function process($formField, string $formUid, int $index): ?Field
    {
        $field = parent::process($formField, $formUid, $index);
        if (!$field) {
            return null;
        }

        // Avoid collisions with Craft/Freeform element properties like "children"
        $originalHandle = $field->handle;
        if ($this->isReservedSubmissionProperty($originalHandle)) {
            $field->handle = $originalHandle.'_table';
            if (isset($field->metadata['handle'])) {
                $field->metadata['handle'] = $field->handle;
            }
        }

        return $field;
    }

    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Table' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TableField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['tableLayout'] = $this->buildTableLayout($formField);
        if (empty($metadata['tableLayout'])) {
            $metadata['tableLayout'] = [
                [
                    'label' => 'Column',
                    'value' => '',
                    'type' => TableField::COLUMN_TYPE_STRING,
                    'placeholder' => '',
                    'options' => [],
                    'checked' => false,
                    'required' => false,
                ],
            ];
        }

        if (property_exists($formField, 'useScript')) {
            $metadata['useScript'] = (bool) $formField->useScript;
        }

        if (property_exists($formField, 'maxRows') && is_numeric($formField->maxRows)) {
            $metadata['maxRows'] = (int) $formField->maxRows;
        }

        if (property_exists($formField, 'addButtonLabel') && \is_string($formField->addButtonLabel)) {
            $metadata['addButtonLabel'] = $formField->addButtonLabel;
        }

        if (property_exists($formField, 'removeButtonLabel') && \is_string($formField->removeButtonLabel)) {
            $metadata['removeButtonLabel'] = $formField->removeButtonLabel;
        }

        return $metadata;
    }

    public function getSanitizedHandle(string $handle): string
    {
        return $this->isReservedSubmissionProperty($handle) ? $handle.'_table' : $handle;
    }

    public function convertSubmissionValue(FormieTable $formieField, mixed $value): array
    {
        // Convert objects/JSON strings to arrays
        if (\is_string($value)) {
            $decoded = json_decode($value, true);
            if (\JSON_ERROR_NONE === json_last_error()) {
                $value = $decoded;
            }
        }
        if (\is_object($value)) {
            $value = json_decode(json_encode($value), true) ?: [];
        }
        if (!\is_array($value)) {
            return [];
        }

        // Determine expected column order from the Formie field definition
        $columnKeys = [];
        if (property_exists($formieField, 'columns') && \is_array($formieField->columns)) {
            $columnKeys = array_keys($formieField->columns);
        } elseif (method_exists($formieField, 'getSettings')) {
            $settings = $formieField->getSettings();
            if (\is_array($settings) && isset($settings['columns']) && \is_array($settings['columns'])) {
                $columnKeys = array_keys($settings['columns']);
            }
        }

        // Ensure a numeric-indexed array of rows with index-based columns as Freeform expects
        $normalized = [];
        foreach ($value as $row) {
            if (!\is_array($row)) {
                continue;
            }

            $numericRow = [];
            if (!empty($columnKeys) && array_keys($row) !== range(0, \count($row) - 1)) {
                // Associative row; map using the known column order
                foreach ($columnKeys as $key) {
                    $numericRow[] = $row[$key] ?? '';
                }
            } else {
                // Already numeric or unknown order; reindex preserving order
                foreach ($row as $colValue) {
                    $numericRow[] = $colValue;
                }
            }

            $normalized[] = $numericRow;
        }

        return $normalized;
    }

    private function buildTableLayout($formField): array
    {
        $columns = [];

        $formieColumns = [];
        if (property_exists($formField, 'columns') && \is_array($formField->columns)) {
            $formieColumns = $formField->columns;
        } elseif (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['columns']) && \is_array($settings['columns'])) {
                $formieColumns = $settings['columns'];
            }
        }

        foreach ($formieColumns as $col) {
            $label = $this->readFirstString($col, ['label', 'heading', 'name', 'title'], 'Column');
            $type = $this->mapColumnType($this->readFirstString($col, ['type', 'columnType'], 'text'));
            $placeholder = $this->readFirstString($col, ['placeholder', 'hint'], '');
            $required = $this->readFirstBool($col, ['required', 'isRequired'], false);

            $defaultValue = '';
            $checked = false;
            $options = [];

            if (TableField::COLUMN_TYPE_DROPDOWN === $type || TableField::COLUMN_TYPE_RADIO === $type) {
                $options = $this->extractOptionStrings($col);
                $defaultValue = $this->readFirstString($col, ['defaultValue', 'value'], $options[0] ?? '');
            } elseif (TableField::COLUMN_TYPE_CHECKBOX === $type) {
                $checked = $this->readFirstBool($col, ['default', 'checked', 'value'], false);
                $defaultValue = $checked ? '1' : '0';
            } else {
                $defaultValue = $this->readFirstString($col, ['defaultValue', 'value'], '');
            }

            $columns[] = [
                'label' => $label,
                'value' => $defaultValue,
                'type' => $type,
                'placeholder' => $placeholder,
                'options' => $options,
                'checked' => $checked,
                'required' => $required,
            ];
        }

        return $columns;
    }

    private function mapColumnType(string $formieType): string
    {
        $formieType = strtolower($formieType);

        return match ($formieType) {
            'dropdown', 'select' => TableField::COLUMN_TYPE_DROPDOWN,
            'checkbox' => TableField::COLUMN_TYPE_CHECKBOX,
            'radio', 'radios' => TableField::COLUMN_TYPE_RADIO,
            'textarea', 'multiline', 'multi-line', 'multi_line' => TableField::COLUMN_TYPE_TEXTAREA,
            default => TableField::COLUMN_TYPE_STRING,
        };
    }

    private function extractOptionStrings(array $col): array
    {
        $rawOptions = [];
        if (isset($col['options']) && \is_array($col['options'])) {
            $rawOptions = $col['options'];
        } elseif (isset($col['values']) && \is_array($col['values'])) {
            $rawOptions = $col['values'];
        }

        $strings = [];
        foreach ($rawOptions as $opt) {
            if (\is_array($opt)) {
                $strings[] = (string) ($opt['value'] ?? $opt['label'] ?? '');
            } else {
                $strings[] = (string) $opt;
            }
        }

        return array_values(array_filter($strings, static fn ($v) => '' !== $v));
    }

    private function readFirstString(array $source, array $keys, string $default): string
    {
        foreach ($keys as $key) {
            if (isset($source[$key]) && \is_string($source[$key])) {
                return $source[$key];
            }
        }

        return $default;
    }

    private function readFirstBool(array $source, array $keys, bool $default): bool
    {
        foreach ($keys as $key) {
            if (isset($source[$key])) {
                return (bool) $source[$key];
            }
        }

        return $default;
    }

    private function isReservedSubmissionProperty(string $handle): bool
    {
        $reserved = [
            'children',
        ];

        return \in_array($handle, $reserved, true);
    }
}
