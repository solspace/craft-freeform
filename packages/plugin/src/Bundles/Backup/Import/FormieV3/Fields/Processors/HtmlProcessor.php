<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

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

        $metadata['content'] = $this->getHtmlContent($formField);
        $metadata['purifyContent'] = $this->getPurifyContent($formField);
        $metadata['tag'] = 'div';
        $metadata['instructions'] = $this->getInstructions($formField);
        $metadata['enabled'] = $this->getEnabled($formField);
        $metadata['required'] = $this->getRequired($formField);

        return $metadata;
    }

    private function getHtmlContent($formField): string
    {
        $contentSources = ['htmlContent', 'content', 'defaultValue', 'label'];

        foreach ($contentSources as $source) {
            if (property_exists($formField, $source) && !empty($formField->{$source})) {
                $content = $formField->{$source};
                if ('HTML Content....' !== $content && 'HTML....' !== $content) {
                    return $content;
                }
            }
        }

        return $formField->label ?? 'HTML Content';
    }

    private function getPurifyContent($formField): bool
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->purifyContent ?? true;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['purifyContent'])) {
                return (bool) $settings['purifyContent'];
            }
        }

        return true;
    }

    private function getInstructions($formField): ?string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->instructions ?? null;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['instructions'])) {
                return $settings['instructions'];
            }
        }

        return null;
    }

    private function getEnabled($formField): bool
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->enabled ?? true;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['enabled'])) {
                return (bool) $settings['enabled'];
            }
        }

        return true;
    }

    private function getRequired($formField): bool
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->required ?? false;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['required'])) {
                return (bool) $settings['required'];
            }
        }

        return false;
    }
}
