<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\CheckboxField;

class AgreeProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Agree' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CheckboxField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Map Formie Agree field specific properties
        $metadata['fieldType'] = 'checkbox';
        $metadata['checkedByDefault'] = $formField->defaultValue ?? false;

        // Handle description (Formie stores it as rich text content) - this becomes the label in Freeform
        $label = '';
        if (property_exists($formField, 'description') && $formField->description) {
            if (\is_array($formField->description)) {
                // Extract text from rich text content structure
                $label = $this->extractTextFromRichContent($formField->description);
            } else {
                $label = $formField->description;
            }
        }

        // Override the label with the description content
        $metadata['label'] = $label;

        return $metadata;
    }

    /**
     * Extract plain text from Formie's rich text content structure.
     */
    private function extractTextFromRichContent(array $content): string
    {
        $text = '';

        foreach ($content as $block) {
            if (isset($block['type']) && 'paragraph' === $block['type']) {
                if (isset($block['content']) && \is_array($block['content'])) {
                    foreach ($block['content'] as $textBlock) {
                        if (isset($textBlock['type']) && 'text' === $textBlock['type']) {
                            $text .= $textBlock['text'] ?? '';
                        }
                    }
                }
            }
        }

        return trim($text);
    }
}
