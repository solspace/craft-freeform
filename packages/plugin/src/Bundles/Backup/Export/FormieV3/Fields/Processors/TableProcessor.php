<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\TableField;

class TableProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Table' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return TableField::class;
    }

    public function getFieldMetadata($formField): array
    {
        return $this->getBaseMetadata($formField);
    }
}
