<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

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

        $headingSize = $this->getHeadingSize($formField);
        $headingContent = $this->getHeadingContent($formField);

        $wrappedContent = $this->wrapInHeadingTag($headingContent, $headingSize);
        $metadata['content'] = $wrappedContent;
        $metadata['headingSize'] = $headingSize;
        $metadata['tag'] = $headingSize;

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

        if ('Heading Text....' === $formField->label) {
            $headingSize = $this->getHeadingSize($formField);

            return ucfirst(str_replace('h', 'Heading ', $headingSize));
        }

        return $formField->label ?? 'Heading';
    }

    private function getHeadingSize($formField): string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->headingSize ?? 'h2';
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['headingSize'])) {
                return $settings['headingSize'];
            }
        }

        return 'h2';
    }

    private function wrapInHeadingTag(string $content, string $headingSize): string
    {
        $validHeadingSizes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        $safeHeadingSize = \in_array($headingSize, $validHeadingSizes) ? $headingSize : 'h2';

        $escapedContent = htmlspecialchars($content, \ENT_QUOTES, 'UTF-8');

        return "<{$safeHeadingSize}>{$escapedContent}</{$safeHeadingSize}>";
    }
}
