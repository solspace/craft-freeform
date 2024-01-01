<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\SettingsService;

class AjaxToggleGenerator implements ValueGeneratorInterface
{
    public function __construct(private SettingsService $settingsService) {}

    public function generateValue(?object $referenceObject): bool
    {
        return $this->settingsService->isAjaxEnabledByDefault();
    }
}
