<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\HtmlField;

class SectionProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Section' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return HtmlField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);
        $metadata['content'] = $formField->content ?? '';
        $metadata['collapsible'] = $formField->collapsible ?? false;
        $metadata['collapsed'] = $formField->collapsed ?? false;

        return $metadata;
    }
}
