<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;

class PasswordProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Password' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return PasswordField::class;
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
}
