<?php

namespace Solspace\Freeform\Form\Settings;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Symfony\Component\Serializer\Annotation\Ignore;

/**
 * @mixin GeneralSettings
 */
class Settings
{
    private BehaviorSettings $behavior;
    private GeneralSettings $general;

    #[Ignore]
    private PropertyAccessor $accessor;

    public function __construct(array $settings = [], PropertyProvider $propertyProvider)
    {
        $this->behavior = new BehaviorSettings();
        $this->general = new GeneralSettings();
        $this->accessor = new PropertyAccessor();

        $reflection = new \ReflectionClass($this);
        foreach ($settings as $propertyKey => $propertySettings) {
            try {
                $property = $reflection->getProperty($propertyKey);
            } catch (\ReflectionException) {
                continue;
            }

            $object = $this->accessor->getValue($this, $property->getName());
            if (!$object instanceof SettingsNamespace) {
                continue;
            }

            $propertyProvider->setObjectProperties($object, $propertySettings);
        }
    }

    public function __isset(string $name)
    {
        foreach ($this->getProperties() as $property) {
            if ($this->hasProperty($property, $name)) {
                return true;
            }
        }

        return isset($this->{$name});
    }

    public function __get(string $name)
    {
        foreach ($this->getProperties() as $property) {
            if ($this->hasProperty($property, $name)) {
                return $this->accessor->getValue($property->getValue($this), $name);
            }
        }

        if (isset($this->{$name})) {
            return $this->{$name};
        }

        return null;
    }

    public function toArray(): array
    {
        $array = [];
        foreach ($this->getProperties() as $property) {
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

    private function getProperties(): array
    {
        $reflection = new \ReflectionClass($this);

        return $reflection->getProperties();
    }

    private function hasProperty($property, string $name): bool
    {
        $setting = $property->getValue($this);

        return isset($setting->{$name});
    }
}
