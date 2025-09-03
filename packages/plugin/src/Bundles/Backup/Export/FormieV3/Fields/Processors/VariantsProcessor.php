<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\DropdownField;

class VariantsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Variants' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DropdownField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['source'] = 'variants';
        $metadata['multiple'] = $formField->multiple ?? false;
        $metadata['limit'] = $formField->limit ?? '';

        return $metadata;
    }
}
