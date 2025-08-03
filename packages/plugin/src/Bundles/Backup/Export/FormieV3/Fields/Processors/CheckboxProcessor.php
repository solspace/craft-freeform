<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxField;

class CheckboxProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Checkbox' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['defaultValue'] = $formField->defaultValue ?? false;

        return $metadata;
    }
}
