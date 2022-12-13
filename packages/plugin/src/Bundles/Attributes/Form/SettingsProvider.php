<?php

namespace Solspace\Freeform\Bundles\Attributes\Form;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Form\Settings\SettingsInterface;

class SettingsProvider
{
    public function __construct(private PropertyProvider $propertyProvider)
    {
    }

    /**
     * @return SettingNamespace[]
     */
    public function getSettingNamespaces(): array
    {
        $settingsReflection = new \ReflectionClass(Settings::class);

        $namespaces = [];
        foreach ($settingsReflection->getProperties() as $property) {
            $propertyType = $property->getType();

            if ($propertyType->isBuiltin()) {
                continue;
            }

            try {
                $propertyReflection = new \ReflectionClass($propertyType->getName());
            } catch (\ReflectionException) {
                continue;
            }

            if (!$propertyReflection->implementsInterface(SettingsInterface::class)) {
                continue;
            }

            $namespaceAttribute = $propertyReflection->getAttributes(SettingNamespace::class)[0];

            /** @var SettingNamespace $namespace */
            $namespace = $namespaceAttribute->newInstance();
            $namespace->handle = $property->getName();
            $namespace->properties = $this->propertyProvider->getEditableProperties($propertyReflection->getName());

            $namespaces[] = $namespace;
        }

        return $namespaces;
    }
}
