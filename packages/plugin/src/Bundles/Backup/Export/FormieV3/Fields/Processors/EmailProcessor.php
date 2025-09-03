<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\EmailField;

class EmailProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Email' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return EmailField::class;
    }

    public function getFieldMetadata($formField): array
    {
        return $this->getBaseMetadata($formField);
    }
}
