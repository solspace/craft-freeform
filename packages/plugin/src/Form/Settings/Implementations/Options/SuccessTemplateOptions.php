<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Services\SettingsService;

class SuccessTemplateOptions implements OptionsGeneratorInterface
{
    public function __construct(private SettingsService $settingsService) {}

    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $templates = $this->settingsService->getSuccessTemplates();
        foreach ($templates as $template) {
            $options->add($template->getFileName(), $template->getName());
        }

        return $options;
    }
}
