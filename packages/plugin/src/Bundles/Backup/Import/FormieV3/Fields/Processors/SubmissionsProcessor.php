<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\TextField;

class SubmissionsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Submissions' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TextField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['fieldType'] = 'submissions';
        $metadata['multiple'] = $formField->multiple ?? false;
        $metadata['limit'] = $formField->limit ?? '';

        return $metadata;
    }
}
