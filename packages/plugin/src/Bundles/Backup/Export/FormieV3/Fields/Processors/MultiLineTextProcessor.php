<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\TextareaField;

class MultiLineTextProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\MultiLineText' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextareaField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Map common textarea-specific settings if present on Formie field
        if (isset($formField->rows) && is_numeric($formField->rows)) {
            $metadata['rows'] = (int) $formField->rows;
        } elseif (isset($formField->textareaRows) && is_numeric($formField->textareaRows)) {
            $metadata['rows'] = (int) $formField->textareaRows;
        }

        if (isset($formField->maxLength) && is_numeric($formField->maxLength)) {
            $metadata['maxLength'] = (int) $formField->maxLength;
        }

        return $metadata;
    }
}
