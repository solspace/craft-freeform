<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\GroupField;

class GroupProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Group' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return GroupField::class;
    }

    public function getFieldMetadata($formField): array
    {
        return $this->getBaseMetadata($formField);
    }
}
