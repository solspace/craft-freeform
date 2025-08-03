<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\DropdownField;

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

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['source'] = 'recipients';
        $metadata['multiple'] = $formField->multiple ?? false;
        $metadata['limit'] = $formField->limit ?? '';

        return $metadata;
    }
}
