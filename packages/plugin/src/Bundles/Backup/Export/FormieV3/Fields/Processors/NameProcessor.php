<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Fields\Implementations\TextField;

class NameProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Name' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextField::class;
    }

    public function getSubFields($formField, string $formUid, int $index): array
    {
        $fields = [];

        // Check if multiple name fields are enabled
        $useMultipleFields = $formField->useMultipleFields ?? false;

        if (!$useMultipleFields) {
            // Single name field - create one text field
            $nameField = new Field();
            $nameField->uid = $formField->uid;
            $nameField->name = $formField->label ?? 'Name';
            $nameField->handle = $formField->handle ?? 'name';
            $nameField->type = TextField::class;
            $nameField->required = $formField->required ?? false;
            $nameField->order = $index;
            $nameField->metadata = [
                'fieldType' => 'text',
                'placeholder' => $formField->placeholder ?? 'Name',
                'maxLength' => $formField->maxLength ?? null,
            ];
            $fields[] = $nameField;

            return $fields;
        }

        // Multiple name fields enabled - try to get the actual subfields from Formie
        $nameSubfields = $this->getNameSubfields($formField);

        // If we got the actual subfields, use their individual required settings
        if (!empty($nameSubfields)) {
            foreach ($nameSubfields as $subfield) {
                $freeformField = $this->createFieldFromSubfield($subfield, $formField, $formUid, $index);
                if ($freeformField) {
                    $fields[] = $freeformField;
                }
            }
        } else {
            // Fallback to creating subfields manually (original approach)
            $fields = $this->createManualSubfields($formField, $formUid, $index);
        }

        return $fields;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['fieldType'] = 'name';
        $metadata['showPrefix'] = $formField->showPrefix ?? false;
        $metadata['showMiddle'] = $formField->showMiddle ?? false;
        $metadata['showSuffix'] = $formField->showSuffix ?? false;
        $metadata['firstNameMaxLength'] = $formField->firstNameMaxLength ?? null;
        $metadata['lastNameMaxLength'] = $formField->lastNameMaxLength ?? null;
        $metadata['prefixMaxLength'] = $formField->prefixMaxLength ?? null;
        $metadata['middleNameMaxLength'] = $formField->middleNameMaxLength ?? null;

        return $metadata;
    }

    private function getNameSubfields($formField): array
    {
        $subfields = [];

        // Try different methods to get nested fields (same pattern as GroupProcessor)
        if (property_exists($formField, 'fields') && \is_array($formField->fields)) {
            $subfields = $formField->fields;
        } elseif (property_exists($formField, 'subfields') && \is_array($formField->subfields)) {
            $subfields = $formField->subfields;
        } elseif (method_exists($formField, 'getFields')) {
            $subfields = $formField->getFields();
        } elseif (method_exists($formField, 'getSubfields')) {
            $subfields = $formField->getSubfields();
        } elseif (method_exists($formField, 'getNestedFields')) {
            $subfields = $formField->getNestedFields();
        }

        // Try to access via settings
        if (empty($subfields)) {
            if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
                $settings = $formField->settings;
                if (property_exists($settings, 'fields') && \is_array($settings->fields)) {
                    $subfields = $settings->fields;
                }
            }
        }

        // Try to access via getSettings method
        if (empty($subfields)) {
            if (method_exists($formField, 'getSettings')) {
                $settings = $formField->getSettings();
                if (\is_array($settings) && isset($settings['fields'])) {
                    $subfields = $settings['fields'];
                }
            }
        }

        // Filter to only include enabled subfields
        if (!empty($subfields)) {
            $subfields = array_filter($subfields, static function ($subfield) {
                // Check if subfield has enabled property and it's true
                if (property_exists($subfield, 'enabled')) {
                    return true === $subfield->enabled;
                }

                // Check if subfield has settings with enabled property
                if (property_exists($subfield, 'settings') && \is_object($subfield->settings)) {
                    if (property_exists($subfield->settings, 'enabled')) {
                        return true === $subfield->settings->enabled;
                    }
                }

                // Check if subfield has getSettings method
                if (method_exists($subfield, 'getSettings')) {
                    $settings = $subfield->getSettings();
                    if (\is_array($settings) && isset($settings['enabled'])) {
                        return true === $settings['enabled'];
                    }
                }

                // If we can't determine, assume it's enabled (fallback)
                return true;
            });
        }

        return \is_array($subfields) ? $subfields : [];
    }

    private function createFieldFromSubfield($subfield, $parentField, string $formUid, int $index): ?Field
    {
        $field = new Field();
        $field->uid = $subfield->uid ?? StringHelper::UUID();
        $field->name = $subfield->label ?? $subfield->handle ?? 'Subfield';
        $field->handle = ($parentField->handle ?? 'name').'_'.($subfield->handle ?? 'subfield');
        $field->type = TextField::class;

        // Use the subfield's individual required setting
        $field->required = $subfield->required ?? false;

        $field->order = $index + $this->getSubfieldOrderOffset($subfield->handle ?? '');
        $field->metadata = [
            'fieldType' => 'text',
            'placeholder' => $this->getSubfieldPlaceholder($subfield),
            'maxLength' => $this->getSubfieldMaxLength($subfield),
        ];

        return $field;
    }

    private function getSubfieldOrderOffset(string $handle): float
    {
        $offsets = [
            'prefix' => -0.1,
            'firstName' => 0.0,
            'middleName' => 0.05,
            'lastName' => 0.1,
        ];

        return $offsets[$handle] ?? 0.0;
    }

    private function getSubfieldPlaceholder($subfield): ?string
    {
        if (property_exists($subfield, 'placeholder') && !empty($subfield->placeholder)) {
            return $subfield->placeholder;
        }

        if (property_exists($subfield, 'settings') && \is_object($subfield->settings)) {
            if (property_exists($subfield->settings, 'placeholder') && !empty($subfield->settings->placeholder)) {
                return $subfield->settings->placeholder;
            }
        }

        if (method_exists($subfield, 'getSettings')) {
            $settings = $subfield->getSettings();
            if (\is_array($settings) && isset($settings['placeholder']) && !empty($settings['placeholder'])) {
                return $settings['placeholder'];
            }
        }

        return null;
    }

    private function getSubfieldMaxLength($subfield): ?int
    {
        if (property_exists($subfield, 'maxLength') && $subfield->maxLength > 0) {
            return $subfield->maxLength;
        }

        if (property_exists($subfield, 'settings') && \is_object($subfield->settings)) {
            if (property_exists($subfield->settings, 'maxLength') && $subfield->settings->maxLength > 0) {
                return $subfield->settings->maxLength;
            }
        }

        if (method_exists($subfield, 'getSettings')) {
            $settings = $subfield->getSettings();
            if (\is_array($settings) && isset($settings['maxLength']) && $settings['maxLength'] > 0) {
                return $settings['maxLength'];
            }
        }

        return null;
    }

    private function createManualSubfields($formField, string $formUid, int $index): array
    {
        $fields = [];

        // Create prefix field if enabled
        if ($formField->showPrefix ?? false) {
            $prefixField = new Field();
            $prefixField->uid = StringHelper::UUID();
            $prefixField->name = 'Prefix';
            $prefixField->handle = ($formField->handle ?? 'name').'_prefix';
            $prefixField->type = TextField::class;
            $prefixField->required = false;
            $prefixField->order = $index - 0.1;
            $prefixField->metadata = [
                'fieldType' => 'text',
                'placeholder' => null,
                'maxLength' => $formField->prefixMaxLength ?? null,
            ];
            $fields[] = $prefixField;
        }

        // Always create first name field
        $firstNameField = new Field();
        $firstNameField->uid = StringHelper::UUID();
        $firstNameField->name = 'First Name';
        $firstNameField->handle = ($formField->handle ?? 'name').'_first';
        $firstNameField->type = TextField::class;
        $firstNameField->required = $formField->required ?? false;
        $firstNameField->order = $index;
        $firstNameField->metadata = [
            'fieldType' => 'text',
            'placeholder' => null,
            'maxLength' => $formField->firstNameMaxLength ?? null,
        ];
        $fields[] = $firstNameField;

        // Create middle name field if enabled
        if ($formField->showMiddle ?? false) {
            $middleNameField = new Field();
            $middleNameField->uid = StringHelper::UUID();
            $middleNameField->name = 'Middle Name';
            $middleNameField->handle = ($formField->handle ?? 'name').'_middle';
            $middleNameField->type = TextField::class;
            $middleNameField->required = false;
            $middleNameField->order = $index + 0.05;
            $middleNameField->metadata = [
                'fieldType' => 'text',
                'placeholder' => null,
                'maxLength' => $formField->middleNameMaxLength ?? null,
            ];
            $fields[] = $middleNameField;
        }

        // Create last name field
        $lastNameField = new Field();
        $lastNameField->uid = StringHelper::UUID();
        $lastNameField->name = 'Last Name';
        $lastNameField->handle = ($formField->handle ?? 'name').'_last';
        $lastNameField->type = TextField::class;
        $lastNameField->required = $formField->required ?? false;
        $lastNameField->order = $index + 0.1;
        $lastNameField->metadata = [
            'fieldType' => 'text',
            'placeholder' => null,
            'maxLength' => $formField->lastNameMaxLength ?? null,
        ];
        $fields[] = $lastNameField;

        return $fields;
    }
}
