<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Toolbars;

use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Services\SettingsService;

class RichTextToolbarConfiguration implements ToolbarConfigurationInterface
{
    public function __construct(private SettingsService $settingsService) {}

    public function fetchComponents(?Property $property): array
    {
        return [$this->settingsService->getSettingsModel()->defaults->richTextFieldToolbarConfiguration];
    }
}
