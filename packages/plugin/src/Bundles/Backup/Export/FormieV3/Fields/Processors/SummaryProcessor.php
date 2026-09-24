<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\SummaryField;

class SummaryProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Summary' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return SummaryField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['hideEmpty'] = true;

        return $metadata;
    }
}
