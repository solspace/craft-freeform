<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\RadiosField;

class RadioProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Radio' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return RadiosField::class;
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
