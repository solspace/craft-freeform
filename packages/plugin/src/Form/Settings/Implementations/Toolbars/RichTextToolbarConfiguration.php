<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Toolbars;

use craft\helpers\App;
use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Services\SettingsService;

class RichTextToolbarConfiguration implements ToolbarConfigurationInterface
{
    public function __construct(private SettingsService $settingsService) {}

    public function fetchComponents(?Property $property): array
    {
        $richTextFieldToolbarConfiguration = App::parseEnv($this->settingsService->getSettingsModel()->defaults->richTextFieldToolbarConfiguration);

        if (!\is_array($richTextFieldToolbarConfiguration)) {
            return [$richTextFieldToolbarConfiguration];
        }

        return $richTextFieldToolbarConfiguration;
    }
}
