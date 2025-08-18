<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DateField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Helpers\HashHelper;

class GroupProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Group' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return GroupField::class;
    }

    public function process($formField, string $formUid, int $index): ?Field
    {
        $field = new Field();
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'field'.$index, 32);
        $field->name = $formField->label ?? 'Group';
        $field->handle = $this->getFieldHandle($formField->handle ?? 'group');
        $field->type = $this->getFreeformFieldClass();
        $field->required = $formField->required ?? false;
        $field->metadata = $this->getFieldMetadata($formField);

        // Create layout for the GroupField with proper nested field structure
        $field->layout = $this->createLayout($formField, $formUid, $index);

        return $field;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Add group-specific properties
        $metadata['collapsible'] = $formField->collapsible ?? false;
        $metadata['collapsed'] = $formField->collapsed ?? false;

        return $metadata;
    }

    private function createLayout($formField, string $formUid, int $index): Layout
    {
        $layout = new Layout();
        $layout->uid = HashHelper::sha1($formUid.'layout'.$index, 32);

        $rows = new RowCollection();

        // Create a single row with all group fields
        $row = new Row();
        $row->uid = HashHelper::sha1($formUid.'row'.$index, 32);

        $fields = new FieldCollection();

        $fieldIndex = 0;

        // Get the nested fields from the group
        $nestedFields = $this->getNestedFields($formField);
        $parentHandle = $this->getFieldHandle($formField->handle ?? 'group');

        if (!empty($nestedFields)) {
            foreach ($nestedFields as $nestedField) {
                // Create a simple nested field that can be saved to database
                $mappedField = $this->createNestedField($nestedField, $parentHandle, $formUid, $index, $fieldIndex);

                if ($mappedField) {
                    $fields->add($mappedField);
                    ++$fieldIndex;
                }
            }
        } else {
            // If no nested fields found, create a default text field
            $fields->add($this->createDefaultSubfield(
                $parentHandle,
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        $row->fields = $fields;
        $rows->add($row);
        $layout->rows = $rows;

        return $layout;
    }

    private function createNestedField($nestedField, string $parentHandle, string $formUid, int $parentIndex, int $fieldIndex): ?Field
    {
        // Create a simple nested field that can be saved to database
        $field = new Field();
        $field->uid = HashHelper::sha1($formUid.'subfield'.$parentIndex.$fieldIndex.$parentHandle, 32);
        $field->name = $nestedField->label ?? 'Field';
        $nestedHandle = $nestedField->handle ?? 'field'.$fieldIndex;
        $field->handle = $parentHandle.'_'.$nestedHandle;
        $field->type = $this->getFieldTypeClass($nestedField);
        $field->required = $nestedField->required ?? false;

        $metadata = [
            'label' => $nestedField->label ?? 'Field',
            'handle' => $field->handle,
            'required' => $nestedField->required ?? false,
        ];

        $field->metadata = $metadata;

        return $field;
    }

    private function getFieldTypeClass($nestedField): string
    {
        // Map Formie field types to Freeform field types
        $typeMap = [
            'verbb\formie\fields\SingleLineText' => TextField::class,
            'verbb\formie\fields\MultiLineText' => TextareaField::class,
            'verbb\formie\fields\Email' => EmailField::class,
            'verbb\formie\fields\Number' => NumberField::class,
            'verbb\formie\fields\Checkboxes' => CheckboxesField::class,
            'verbb\formie\fields\Dropdown' => DropdownField::class,
            'verbb\formie\fields\Radio' => RadiosField::class,
            'verbb\formie\fields\Checkbox' => CheckboxField::class,
            'verbb\formie\fields\FileUpload' => FileUploadField::class,
            'verbb\formie\fields\Date' => DateField::class,
            'verbb\formie\fields\Hidden' => HiddenField::class,
            'verbb\formie\fields\Table' => TableField::class,
        ];

        $formieType = $nestedField::class;

        return $typeMap[$formieType] ?? TextField::class;
    }

    private function getNestedFields($formField): array
    {
        $nestedFields = [];

        // Robustly try different methods to get nested fields (align with Repeater)
        if (property_exists($formField, 'fields') && \is_array($formField->fields)) {
            $nestedFields = $formField->fields;
        } elseif (property_exists($formField, 'nestedFields') && \is_array($formField->nestedFields)) {
            $nestedFields = $formField->nestedFields;
        } elseif (method_exists($formField, 'getFields')) {
            $nestedFields = $formField->getFields();
        } elseif (method_exists($formField, 'getNestedFields')) {
            $nestedFields = $formField->getNestedFields();
        }

        if (empty($nestedFields)) {
            if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
                $settings = $formField->settings;
                if (property_exists($settings, 'fields') && \is_array($settings->fields)) {
                    $nestedFields = $settings->fields;
                }
            } elseif (method_exists($formField, 'getSettings')) {
                $settings = $formField->getSettings();
                if (\is_array($settings) && isset($settings['fields'])) {
                    $nestedFields = $settings['fields'];
                }
            }
        }

        return \is_array($nestedFields) ? $nestedFields : [];
    }

    private function createDefaultSubfield(string $parentHandle, string $formUid, int $parentIndex, int $fieldIndex): Field
    {
        $field = new Field();
        $field->uid = HashHelper::sha1($formUid.'subfield'.$parentIndex.$fieldIndex.$parentHandle, 32);
        $field->name = 'Field';
        $field->handle = $parentHandle.'_field'.$fieldIndex;
        $field->type = TextField::class;
        $field->required = false;

        $metadata = [
            'label' => 'Field',
            'handle' => $field->handle,
            'required' => false,
        ];

        $field->metadata = $metadata;

        return $field;
    }

    private function createSubfield($formField, string $handle, string $label, string $placeholder, bool $required, string $type, string $formUid, int $parentIndex, int $fieldIndex, array $options = []): Field
    {
        $subfield = new Field();
        // Create a unique UID for each nested field that can be used as a database record
        // Use a more unique pattern to avoid conflicts with existing fields
        $subfield->uid = HashHelper::sha1($formUid.'nested'.$parentIndex.$fieldIndex.$handle, 32);
        $subfield->name = $label;
        $subfield->handle = $handle;
        $subfield->type = $this->getFieldTypeClass($type);
        $subfield->required = $required;

        $metadata = [
            'label' => $label,
            'handle' => $handle,
            'placeholder' => $placeholder,
            'required' => $required,
        ];

        if (!empty($options)) {
            $metadata['optionConfiguration'] = [
                'source' => 'custom',
                'useCustomValues' => true,
                'options' => $options,
            ];
        }

        $subfield->metadata = $metadata;

        return $subfield;
    }
}
