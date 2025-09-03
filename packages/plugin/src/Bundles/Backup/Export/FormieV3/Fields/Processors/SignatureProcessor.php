<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;

class SignatureProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Signature' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return SignatureField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['instructions'] = $this->getInstructions($formField);
        $metadata['enabled'] = $this->getEnabled($formField);
        $metadata['required'] = $this->getRequired($formField);
        $metadata['placeholder'] = $this->getPlaceholder($formField);
        $metadata['defaultValue'] = $this->getDefaultValue($formField);
        $metadata['errorMessage'] = $this->getErrorMessage($formField);
        $metadata['includeInEmail'] = $this->getIncludeInEmail($formField);

        // Signature-specific properties
        $metadata['penColor'] = $this->getPenColor($formField);
        $metadata['backgroundColor'] = $this->getBackgroundColor($formField);
        $metadata['width'] = $this->getWidth($formField);
        $metadata['height'] = $this->getHeight($formField);
        $metadata['penWidth'] = $this->getPenWidth($formField);

        return $metadata;
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

    private function getPlaceholder($formField): ?string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->placeholder ?? null;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['placeholder'])) {
                return $settings['placeholder'];
            }
        }

        return null;
    }

    private function getDefaultValue($formField): ?string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->defaultValue ?? null;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['defaultValue'])) {
                return $settings['defaultValue'];
            }
        }

        return null;
    }

    private function getErrorMessage($formField): ?string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->errorMessage ?? null;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['errorMessage'])) {
                return $settings['errorMessage'];
            }
        }

        return null;
    }

    private function getIncludeInEmail($formField): bool
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->includeInEmail ?? true;
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['includeInEmail'])) {
                return (bool) $settings['includeInEmail'];
            }
        }

        return true;
    }

    private function getPenColor($formField): string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->penColor ?? '#000000';
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['penColor'])) {
                return $settings['penColor'];
            }
        }

        return '#000000';
    }

    private function getBackgroundColor($formField): string
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return $formField->settings->backgroundColor ?? '#ffffff';
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['backgroundColor'])) {
                return $settings['backgroundColor'];
            }
        }

        return '#ffffff';
    }

    private function getWidth($formField): int
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return (int) ($formField->settings->width ?? 400);
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['width'])) {
                return (int) $settings['width'];
            }
        }

        return 400;
    }

    private function getHeight($formField): int
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return (int) ($formField->settings->height ?? 200);
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['height'])) {
                return (int) $settings['height'];
            }
        }

        return 200;
    }

    private function getPenWidth($formField): int
    {
        if (property_exists($formField, 'settings') && \is_object($formField->settings)) {
            return (int) ($formField->settings->penWidth ?? 2);
        }

        if (method_exists($formField, 'getSettings')) {
            $settings = $formField->getSettings();
            if (\is_array($settings) && isset($settings['penWidth'])) {
                return (int) $settings['penWidth'];
            }
        }

        return 2;
    }
}
