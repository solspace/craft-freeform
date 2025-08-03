<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxesField;

class CheckboxesProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Checkboxes' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxesField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['optionConfiguration'] = [
            'source' => 'custom',
            'useCustomValues' => true,
            'options' => $this->mapFieldOptions($formField),
        ];

        return $metadata;
    }
}
