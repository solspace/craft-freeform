<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;

class CalculationsProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Calculations' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return CalculationField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['calculations'] = $this->getCalculations($formField);
        $metadata['decimalCount'] = $this->getDecimalCount($formField);

        return $metadata;
    }

    private function getCalculations($formField): string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            $formula = $formField->settings->formula ?? [];

            return $this->convertFormulaToString($formula);
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['formula'])) {
                return $this->convertFormulaToString($settings['formula']);
            }
        }

        return '';
    }

    private function getDecimalCount($formField): ?int
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->decimals ?? null;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['decimals'])) {
                return (int) $settings['decimals'];
            }
        }

        return null;
    }

    private function convertFormulaToString(array $formula): string
    {
        if (empty($formula)) {
            return '';
        }

        $result = '';
        foreach ($formula as $item) {
            if (isset($item['content'])) {
                foreach ($item['content'] as $content) {
                    if (isset($content['type']) && 'variableTag' === $content['type']) {
                        // Extract field handle from {field:handle} format
                        $value = $content['attrs']['value'] ?? '';
                        if (preg_match('/^\{field:([^}]+)\}$/', $value, $matches)) {
                            $result .= 'field:'.$matches[1];
                        } else {
                            $result .= $value;
                        }
                    } elseif (isset($content['text'])) {
                        $result .= $content['text'];
                    }
                }
            }
        }

        return $result;
    }
}
