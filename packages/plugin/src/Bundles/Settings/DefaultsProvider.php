<?php

namespace Solspace\Freeform\Bundles\Settings;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\DefaultConfigInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Services\SettingsService;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class DefaultsProvider
{
    private Defaults $defaults;
    private PropertyAccessor $propertyAccess;

    public function __construct(SettingsService $settingsService)
    {
        $this->defaults = $settingsService->getSettingsModel()->defaults;
        $this->propertyAccess = PropertyAccess::createPropertyAccessor();
    }

    public function getValue(string $path, mixed $default = null): mixed
    {
        $object = $this->propertyAccess->getValue($this->defaults, $path);
        if ($object instanceof DefaultConfigInterface) {
            return $object->getValue();
        }

        return $object ?? $default;
    }

    public function isLocked(string $path): bool
    {
        $object = $this->propertyAccess->getValue($this->defaults, $path);
        if ($object instanceof DefaultConfigInterface) {
            return $object->isLocked();
        }

        return false;
    }
}
