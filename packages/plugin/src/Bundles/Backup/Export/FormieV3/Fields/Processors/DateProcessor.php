<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;

class DateProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Date' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DatetimeField::class;
    }

    public function getFieldMetadata($formField): array
    {
        return $this->getBaseMetadata($formField);
    }
}
