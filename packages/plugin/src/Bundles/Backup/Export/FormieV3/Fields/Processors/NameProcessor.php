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

        // Multiple name fields enabled - create separate fields for each part

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
                'placeholder' => 'Prefix',
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
            'placeholder' => 'First Name',
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
                'placeholder' => 'Middle Name',
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
            'placeholder' => 'Last Name',
            'maxLength' => $formField->lastNameMaxLength ?? null,
        ];
        $fields[] = $lastNameField;

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
}
