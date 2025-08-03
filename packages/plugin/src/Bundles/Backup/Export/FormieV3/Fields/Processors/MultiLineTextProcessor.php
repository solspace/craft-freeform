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
        return $this->getBaseMetadata($formField);
    }
}
