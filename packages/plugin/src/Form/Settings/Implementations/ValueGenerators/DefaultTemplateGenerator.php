<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\SettingsService;

class DefaultTemplateGenerator implements ValueGeneratorInterface
{
    public function __construct(private SettingsService $settingsService)
    {
    }

    public function generateValue(?object $referenceObject): ?string
    {
        $defaultTemplate = $this->settingsService->getSettingsModel()->formattingTemplate;

        $custom = $this->settingsService->getCustomFormTemplates();
        foreach ($custom as $template) {
            if ($template->getFileName() === $defaultTemplate) {
                return $defaultTemplate;
            }
        }

        $base = $this->settingsService->getSolspaceFormTemplates();
        foreach ($base as $template) {
            if ($template->getFileName() === $defaultTemplate) {
                return $defaultTemplate;
            }
        }

        return null;
    }
}
