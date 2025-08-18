<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\HtmlField;

class HeadingProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Heading' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return HtmlField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['content'] = $this->getHeadingContent($formField);
        $metadata['headingSize'] = $this->getHeadingSize($formField);
        $metadata['tag'] = $metadata['headingSize'];

        return $metadata;
    }

    private function getHeadingContent($formField): string
    {
        if (!empty($formField->label) && 'Heading Text....' !== $formField->label) {
            return $formField->label;
        }

        $contentSources = ['defaultValue', 'placeholder', 'heading'];
        foreach ($contentSources as $source) {
            if (property_exists($formField, $source) && !empty($formField->{$source})) {
                return $formField->{$source};
            }
        }

        return $formField->label ?? 'Heading';
    }

    private function getHeadingSize($formField): string
    {
        // Try to get from settings object
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->headingSize ?? 'h2';
        }

        // Try to get from getSettings method
        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['headingSize'])) {
                return $settings['headingSize'];
            }
        }

        return 'h2';
    }
}
