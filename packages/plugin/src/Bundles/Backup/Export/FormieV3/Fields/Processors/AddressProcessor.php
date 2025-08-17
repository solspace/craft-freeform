<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries\Countries;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\States\States;
use Solspace\Freeform\Library\Helpers\HashHelper;

class AddressProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Address' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return GroupField::class;
    }

    public function process($formField, string $formUid, int $index): ?Field
    {
        $field = new Field();
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'field'.$index, 32);
        $field->name = $formField->label ?? 'Address';
        $field->handle = $this->getFieldHandle($formField->handle ?? 'address');
        $field->type = $this->getFreeformFieldClass();
        $field->required = $formField->required ?? false;
        $field->metadata = $this->getFieldMetadata($formField);

        // Create layout for the GroupField with proper nested field structure
        $field->layout = $this->createLayout($formField, $formUid, $index);

        return $field;
    }

    public function getFieldMetadata($formField): array
    {
        return $this->getBaseMetadata($formField);
        // For GroupField, we don't need subfields in metadata since we're using layout
    }

    private function createLayout($formField, string $formUid, int $index): Layout
    {
        $layout = new Layout();
        $layout->uid = HashHelper::sha1($formUid.'layout'.$index, 32);

        $rows = new RowCollection();

        // Create a single row with all address fields
        $row = new Row();
        $row->uid = HashHelper::sha1($formUid.'row'.$index, 32);

        $fields = new FieldCollection();

        $fieldIndex = 0;

        // Address Line 1 (always enabled)
        $fields->add($this->createSubfield(
            $formField,
            'address1',
            $formField->address1Label ?? 'Address Line 1',
            $formField->address1Placeholder ?? '',
            $formField->address1Required ?? true,
            'text',
            $formUid,
            $index,
            $fieldIndex++
        ));

        // Address Line 2 (optional)
        if ($formField->address2Enabled ?? false) {
            $fields->add($this->createSubfield(
                $formField,
                'address2',
                $formField->address2Label ?? 'Address Line 2',
                $formField->address2Placeholder ?? '',
                $formField->address2Required ?? false,
                'text',
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        // Address Line 3 (optional)
        if ($formField->address3Enabled ?? false) {
            $fields->add($this->createSubfield(
                $formField,
                'address3',
                $formField->address3Label ?? 'Address Line 3',
                $formField->address3Placeholder ?? '',
                $formField->address3Required ?? false,
                'text',
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        // City
        if ($formField->cityEnabled ?? true) {
            $fields->add($this->createSubfield(
                $formField,
                'city',
                $formField->cityLabel ?? 'City',
                $formField->cityPlaceholder ?? '',
                $formField->cityRequired ?? false,
                'text',
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        // State/Province
        if ($formField->stateEnabled ?? true) {
            $fields->add($this->createSubfield(
                $formField,
                'state',
                $formField->stateLabel ?? 'State / Province',
                $formField->statePlaceholder ?? '',
                $formField->stateRequired ?? false,
                'text',
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        // ZIP/Postal Code
        if ($formField->zipEnabled ?? true) {
            $fields->add($this->createSubfield(
                $formField,
                'zip',
                $formField->zipLabel ?? 'ZIP / Postal Code',
                $formField->zipPlaceholder ?? '',
                $formField->zipRequired ?? false,
                'text',
                $formUid,
                $index,
                $fieldIndex++
            ));
        }

        // Country (dropdown)
        if ($formField->countryEnabled ?? true) {
            $fields->add($this->createSubfield(
                $formField,
                'country',
                $formField->countryLabel ?? 'Country',
                $formField->countryPlaceholder ?? 'Select an option',
                $formField->countryRequired ?? false,
                'select',
                $formUid,
                $index,
                $fieldIndex++,
                $this->getCountryOptions()
            ));
        }

        // Auto-complete field (if enabled)
        if ($formField->autocompleteEnabled ?? false) {
            $fields->add($this->createSubfield(
                $formField,
                'autocomplete',
                $formField->autocompleteLabel ?? 'Auto-Complete',
                $formField->autocompletePlaceholder ?? '',
                $formField->autocompleteRequired ?? false,
                'text',
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

    private function getFieldTypeClass(string $type): string
    {
        return match ($type) {
            'select' => DropdownField::class,
            default => TextField::class,
        };
    }

    private function getCountryOptions(): array
    {
        $countries = new Countries();
        $options = $countries->generateOptions();

        $result = [];
        foreach ($options as $option) {
            $result[] = [
                'label' => $option->getLabel(),
                'value' => $option->getValue(),
            ];
        }

        return $result;
    }

    private function getStateOptions(): array
    {
        $states = new States();
        $options = $states->generateOptions();

        $result = [];
        foreach ($options as $option) {
            $result[] = [
                'label' => $option->getLabel(),
                'value' => $option->getValue(),
            ];
        }

        return $result;
    }
}
