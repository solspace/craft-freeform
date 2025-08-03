<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;

class CalculationsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Calculations' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CalculationField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['formula'] = $formField->formula ?? '';
        $metadata['decimalPlaces'] = $formField->decimalPlaces ?? 2;

        return $metadata;
    }
}
