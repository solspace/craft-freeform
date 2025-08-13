<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\Collections\FieldCollection;
use Solspace\Freeform\Bundles\Backup\Collections\RowCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\DTO\Layout;
use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Interfaces\FieldProcessorInterface;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Helpers\HashHelper;

class RepeaterProcessor extends AbstractFieldProcessor
{
    private array $nestedFieldProcessors;

    public function __construct()
    {
        // Create processors for nested fields only (excluding RepeaterProcessor to avoid circular dependency)
        $this->nestedFieldProcessors = [
            new SingleLineTextProcessor(),
            new MultiLineTextProcessor(),
            new EmailProcessor(),
            new NumberProcessor(),
            new CheckboxesProcessor(),
            new DropdownProcessor(),
            new RadioProcessor(),
            new CheckboxProcessor(),
            new FileUploadProcessor(),
            new DateProcessor(),
            new TableProcessor(),
            new HtmlProcessor(),
            new HiddenProcessor(),
            new AddressProcessor(),
            new AgreeProcessor(),
            new CalculationsProcessor(),
            new CategoriesProcessor(),
            new EntriesProcessor(),
            new FormsProcessor(),
            new GroupProcessor(),
            new HeadingProcessor(),
            new NameProcessor(),
            new PasswordProcessor(),
            new PaymentProcessor(),
            new PhoneProcessor(),
            new ProductsProcessor(),
            new RecipientsProcessor(),
            new SectionProcessor(),
            new SignatureProcessor(),
            new SubmissionsProcessor(),
            new SummaryProcessor(),
            new TagsProcessor(),
            new UsersProcessor(),
            new VariantsProcessor(),
        ];
    }

    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Repeater' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return GroupField::class;
    }

    public function process($formField, string $formUid, int $index): ?Field
    {
        $field = new Field();
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'field'.$index, 32);
        $field->name = $formField->label ?? 'Repeater';
        $field->handle = $this->getFieldHandle($formField->handle ?? 'repeater');
        $field->type = $this->getFreeformFieldClass();
        $field->required = $formField->required ?? false;
        $field->metadata = $this->getFieldMetadata($formField);

        // Create layout for the GroupField
        $field->layout = $this->createLayout($formField, $formUid, $index);

        return $field;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Add repeater-specific properties
        $metadata['minRows'] = $formField->minRows ?? 0;
        $metadata['maxRows'] = $formField->maxRows ?? '';
        $metadata['addRowLabel'] = $formField->addRowLabel ?? 'Add Row';
        $metadata['removeRowLabel'] = $formField->removeRowLabel ?? 'Remove Row';
        $metadata['duplicateRowLabel'] = $formField->duplicateRowLabel ?? 'Duplicate Row';
        $metadata['reorderRows'] = $formField->reorderRows ?? false;
        $metadata['collapsible'] = $formField->collapsible ?? false;
        $metadata['collapsed'] = $formField->collapsed ?? false;

        return $metadata;
    }

    private function createLayout($formField, string $formUid, int $index): Layout
    {
        $layout = new Layout();
        $layout->uid = HashHelper::sha1($formUid.'layout'.$index, 32);

        $rows = new RowCollection();

        // Create a single row with all repeater fields
        $row = new Row();
        $row->uid = HashHelper::sha1($formUid.'row'.$index, 32);

        $fields = new FieldCollection();

        $fieldIndex = 0;

        // Get the nested fields from the repeater
        $nestedFields = $this->getNestedFields($formField);

        if (!empty($nestedFields)) {
            foreach ($nestedFields as $nestedField) {
                // Use the nested field processors to process each nested field
                $mappedField = $this->mapNestedField($nestedField, $formUid, $fieldIndex);

                if ($mappedField) {
                    // Update the UID to be unique within the repeater context
                    $mappedField->uid = HashHelper::sha1($formUid.'subfield'.$index.$fieldIndex, 32);
                    $fields->add($mappedField);
                }

                ++$fieldIndex;
            }
        } else {
            // If no nested fields found, create a default text field
            $fields->add($this->createDefaultSubfield(
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

    private function mapNestedField($nestedField, string $formUid, int $index): ?Field
    {
        $processor = $this->findNestedFieldProcessor($nestedField);

        if (!$processor) {
            return null; // Skip unsupported field types
        }

        return $processor->process($nestedField, $formUid, $index);
    }

    private function findNestedFieldProcessor($nestedField): ?FieldProcessorInterface
    {
        foreach ($this->nestedFieldProcessors as $processor) {
            if ($processor->canProcess($nestedField)) {
                return $processor;
            }
        }

        return null;
    }

    private function getNestedFields($formField): array
    {
        $nestedFields = [];

        if (property_exists($formField, 'fields') && \is_array($formField->fields)) {
            $nestedFields = $formField->fields;
        } elseif (property_exists($formField, 'nestedFields') && \is_array($formField->nestedFields)) {
            $nestedFields = $formField->nestedFields;
        } elseif (method_exists($formField, 'getFields')) {
            $nestedFields = $formField->getFields();
        } elseif (method_exists($formField, 'getNestedFields')) {
            $nestedFields = $formField->getNestedFields();
        }

        // Try to access via settings
        if (empty($nestedFields)) {
            if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
                $settings = $formField->settings;
                if (property_exists($settings, 'fields') && \is_array($settings->fields)) {
                    $nestedFields = $settings->fields;
                }
            }
        }

        // Try to access via getSettings method
        if (empty($nestedFields)) {
            if (method_exists($formField, 'getSettings')) {
                $settings = $formField->getSettings();
                if (\is_array($settings) && isset($settings['fields'])) {
                    $nestedFields = $settings['fields'];
                }
            }
        }

        return $nestedFields;
    }

    private function createDefaultSubfield(string $formUid, int $parentIndex, int $fieldIndex): Field
    {
        $subfield = new Field();
        $subfield->uid = HashHelper::sha1($formUid.'subfield'.$parentIndex.$fieldIndex, 32);
        $subfield->name = 'Item';
        $subfield->handle = 'item';
        $subfield->type = TextField::class;
        $subfield->required = false;

        $metadata = [
            'label' => 'Item',
            'handle' => 'item',
            'placeholder' => 'Enter item',
            'required' => false,
        ];

        $subfield->metadata = $metadata;

        return $subfield;
    }
}
