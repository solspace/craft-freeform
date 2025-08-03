<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\TextField;

class RepeaterProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Repeater' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['fieldType'] = 'repeater';
        $metadata['minRows'] = $formField->minRows ?? 0;
        $metadata['maxRows'] = $formField->maxRows ?? '';

        return $metadata;
    }
}
