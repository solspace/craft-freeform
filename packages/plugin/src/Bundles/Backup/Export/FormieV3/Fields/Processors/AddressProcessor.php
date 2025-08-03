<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\TextField;

class AddressProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Address' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['fieldType'] = 'address';
        $metadata['showCountry'] = $formField->showCountry ?? true;
        $metadata['showState'] = $formField->showState ?? true;

        return $metadata;
    }
}
