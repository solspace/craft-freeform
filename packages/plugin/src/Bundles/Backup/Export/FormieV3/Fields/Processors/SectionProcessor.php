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

        $metadata['content'] = $this->createHrElement($formField);

        $metadata['borderStyle'] = $this->getBorderStyle($formField);
        $metadata['borderWidth'] = $this->getBorderWidth($formField);
        $metadata['borderColor'] = $this->getBorderColor($formField);

        return $metadata;
    }

    private function createHrElement($formField): string
    {
        $borderStyle = $this->getBorderStyle($formField);
        $borderWidth = $this->getBorderWidth($formField);
        $borderColor = $this->getBorderColor($formField);

        $styles = [];

        if ($borderWidth > 0) {
            $styles[] = "border-top-width: {$borderWidth}px";
        }

        if ($borderStyle && 'none' !== $borderStyle) {
            $styles[] = "border-top-style: {$borderStyle}";
        }

        if ($borderColor && 'transparent' !== $borderColor) {
            $styles[] = "border-top-color: {$borderColor}";
        }

        if (!empty($styles)) {
            $styleString = implode('; ', $styles);

            return "<hr style=\"{$styleString}\" />";
        }

        return '<hr />';
    }

    private function getBorderStyle($formField): ?string
    {
        if (property_exists($formField, 'borderStyle') && !empty($formField->borderStyle)) {
            return $formField->borderStyle;
        }

        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            if (property_exists($formField->settings, 'borderStyle') && !empty($formField->settings->borderStyle)) {
                return $formField->settings->borderStyle;
            }
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['borderStyle']) && !empty($settings['borderStyle'])) {
                return $settings['borderStyle'];
            }
        }

        return 'solid';
    }

    private function getBorderWidth($formField): int
    {
        if (property_exists($formField, 'borderWidth') && $formField->borderWidth > 0) {
            return (int) $formField->borderWidth;
        }

        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            if (property_exists($formField->settings, 'borderWidth') && $formField->settings->borderWidth > 0) {
                return (int) $formField->settings->borderWidth;
            }
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['borderWidth']) && $settings['borderWidth'] > 0) {
                return (int) $settings['borderWidth'];
            }
        }

        return 1;
    }

    private function getBorderColor($formField): ?string
    {
        if (property_exists($formField, 'borderColor') && !empty($formField->borderColor)) {
            return $formField->borderColor;
        }

        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            if (property_exists($formField->settings, 'borderColor') && !empty($formField->settings->borderColor)) {
                return $formField->settings->borderColor;
            }
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['borderColor']) && !empty($settings['borderColor'])) {
                return $settings['borderColor'];
            }
        }

        return '#cccccc';
    }
}
