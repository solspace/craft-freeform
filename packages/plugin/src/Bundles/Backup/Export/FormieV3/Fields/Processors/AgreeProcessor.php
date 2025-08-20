<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Library\Helpers\ProseMirrorHelper;

class AgreeProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Agree' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Map Formie Agree field specific properties
        $metadata['fieldType'] = 'checkbox';
        $metadata['checkedByDefault'] = $formField->defaultValue ?? false;

        // Handle description (Formie stores it as rich text content)
        $label = '';

        if (property_exists($formField, 'description') && $formField->description) {
            if (\is_array($formField->description)) {
                // Convert Formie's ProseMirror rich text content to HTML for Freeform's label
                $label = ProseMirrorHelper::toHtml($formField->description);
            } else {
                $label = $formField->description;
            }
        }

        // Set the label with rich text content
        $metadata['label'] = $label;

        return $metadata;
    }
}
