<?php

namespace Solspace\Freeform\Bundles\Attributes\Form;

use Solspace\Freeform\Form\Settings\Settings;

class SettingsProvider
{
    public function getSettingNamespaces(): array
    {
        $settingsReflection = new \ReflectionClass(Settings::class);

        foreach ($settingsReflection->getProperties() as $property) {
            $propertyType = $property->getType();
        }
    }
}
