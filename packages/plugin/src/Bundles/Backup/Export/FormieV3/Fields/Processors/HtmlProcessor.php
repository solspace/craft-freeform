<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\HtmlField;

class HtmlProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Html' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return HtmlField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['content'] = $formField->content ?? '';

        return $metadata;
    }
}
