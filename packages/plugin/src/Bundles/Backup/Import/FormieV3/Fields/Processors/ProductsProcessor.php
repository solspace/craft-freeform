<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\DropdownField;

class ProductsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Products' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DropdownField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['source'] = 'products';
        $metadata['multiple'] = $formField->multiple ?? false;
        $metadata['limit'] = $formField->limit ?? '';

        return $metadata;
    }
}
