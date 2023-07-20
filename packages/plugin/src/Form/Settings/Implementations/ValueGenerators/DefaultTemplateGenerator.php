<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\SettingsService;

class DefaultTemplateGenerator implements ValueGeneratorInterface
{
    public function __construct(private SettingsService $settingsService)
    {
    }

    public function generateValue(Property $property, string $class, ?object $referenceObject): ?string
    {
        $base = $this->settingsService->getSolspaceFormTemplates();
        if (\count($base)) {
            return $base[0]->getFileName();
        }

        $custom = $this->settingsService->getCustomFormTemplates();
        if (\count($custom)) {
            return $custom[0]->getFileName();
        }

        return null;
    }
}
