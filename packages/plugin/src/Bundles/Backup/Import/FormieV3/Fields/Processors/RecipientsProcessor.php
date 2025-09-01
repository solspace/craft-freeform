<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Helpers\HashHelper;

class RecipientsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Recipients' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DropdownField::class;
    }

    public function process($formField, string $formUid, int $index): ?Field
    {
        $displayType = $this->getDisplayType($formField);
        $fieldClass = $this->getFieldClassByDisplayType($displayType);

        $field = new Field();
        $field->uid = $formField->uid ?? HashHelper::sha1($formUid.'field'.$index, 32);
        $field->name = $formField->label ?? 'Recipients';
        $field->handle = $this->getFieldHandle($formField->handle ?? 'recipients');
        $field->type = $fieldClass;
        $field->required = $formField->required ?? false;
        $field->metadata = $this->getFieldMetadata($formField);

        return $field;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $displayType = $this->getDisplayType($formField);

        $metadata['source'] = 'recipients';
        $metadata['multiple'] = $formField->multiple ?? false;
        $metadata['limit'] = $formField->limit ?? '';

        switch ($displayType) {
            case 'dropdown':
            case 'select':
                $metadata['placeholder'] = $formField->placeholder ?? 'Select recipients...';
                $options = $this->mapFieldOptions($formField);
                if (!empty($options)) {
                    $metadata['optionConfiguration'] = [
                        'source' => 'custom',
                        'useCustomValues' => true,
                        'options' => $options,
                    ];
                }

                break;

            case 'checkboxes':
            case 'checkbox':
                $metadata['columns'] = $formField->columns ?? 1;
                $options = $this->mapFieldOptions($formField);
                if (!empty($options)) {
                    $metadata['optionConfiguration'] = [
                        'source' => 'custom',
                        'useCustomValues' => true,
                        'options' => $options,
                    ];
                }
                $metadata['selectAll'] = $formField->selectAll ?? false;
                $metadata['limit'] = $formField->limit ?? '';
                $metadata['limitMin'] = $formField->limitMin ?? null;
                $metadata['limitMax'] = $formField->limitMax ?? null;
                $metadata['limitRange'] = $formField->limitRange ?? [null, null];

                break;

            case 'radio':
            case 'radios':
                $metadata['columns'] = $formField->columns ?? 1;
                $options = $this->mapFieldOptions($formField);
                if (!empty($options)) {
                    $metadata['optionConfiguration'] = [
                        'source' => 'custom',
                        'useCustomValues' => true,
                        'options' => $options,
                    ];
                }
                $metadata['limit'] = $formField->limit ?? '';
                $metadata['limitMin'] = $formField->limitMin ?? null;
                $metadata['limitMax'] = $formField->limitMax ?? null;
                $metadata['limitRange'] = $formField->limitRange ?? [null, null];

                break;

            case 'multi':
                $metadata['placeholder'] = $formField->placeholder ?? 'Select recipients...';
                $options = $this->mapFieldOptions($formField);
                if (!empty($options)) {
                    $metadata['optionConfiguration'] = [
                        'source' => 'custom',
                        'useCustomValues' => true,
                        'options' => $options,
                    ];
                }

                break;

            case 'text':
            case 'input':
                $metadata['placeholder'] = $formField->placeholder ?? 'Enter recipient email...';

                break;

            case 'email':
                $metadata['placeholder'] = $formField->placeholder ?? 'Enter recipient email...';

                break;
        }

        return $metadata;
    }

    private function getDisplayType($formField): string
    {
        return $formField->displayType ?? $formField->type ?? 'dropdown';
    }

    private function getFieldClassByDisplayType(string $displayType): string
    {
        return match ($displayType) {
            'dropdown', 'select' => DropdownField::class,
            'checkboxes', 'checkbox' => CheckboxesField::class,
            'radio', 'radios' => RadiosField::class,
            'multi' => MultipleSelectField::class,
            'text', 'input' => TextField::class,
            'email' => EmailField::class,
            'hidden' => HiddenField::class,
            default => DropdownField::class,
        };
    }
}
