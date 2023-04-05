<?php

namespace Solspace\Freeform\Form\Settings;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Symfony\Component\PropertyAccess\PropertyAccessor;

/**
 * @mixin GeneralSettings
 */
class Settings
{
    private BehaviorSettings $behavior;
    private GeneralSettings $general;

    public function __construct(array $settings = [], PropertyProvider $propertyProvider)
    {
        $this->behavior = new BehaviorSettings();
        $this->general = new GeneralSettings();

        $access = new PropertyAccessor();

        $reflection = new \ReflectionClass($this);
        foreach ($settings as $propertyKey => $propertySettings) {
            try {
                $property = $reflection->getProperty($propertyKey);
            } catch (\ReflectionException) {
                continue;
            }

            $object = $access->getValue($this, $property->getName());
            if (!$object instanceof SettingsNamespace) {
                continue;
            }

            $propertyProvider->setObjectProperties($object, $propertySettings);
        }
    }

    public function __get(string $name)
    {
        if (isset($this->{$name})) {
            return $this->{$name};
        }

        return $this->general->{$name};
    }

    public function toArray(): array
    {
        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        $array = [];
        foreach ($properties as $property) {
            $array[$property->getName()] = $property->getValue($this);
        }

        return $array;
    }

    public function getBehavior(): BehaviorSettings
    {
        return $this->behavior;
    }

    public function getGeneral(): GeneralSettings
    {
        return $this->general;
    }
}
