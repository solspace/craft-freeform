<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;

class PhoneProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Phone' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return PhoneField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Extract settings from Formie field
        $settings = $this->getFieldSettings($formField);

        // Add phone-specific properties from settings
        $metadata['countryEnabled'] = $settings['countryEnabled'] ?? true;
        $metadata['countryDefaultValue'] = $settings['countryDefaultValue'] ?? null;
        $metadata['countryAllowed'] = $settings['countryAllowed'] ?? [];
        $metadata['countryLanguage'] = $settings['countryLanguage'] ?? 'auto';

        return $metadata;
    }
}
