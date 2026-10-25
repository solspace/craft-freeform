<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Freeform;

class BuilderTemplateOptions implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();
        foreach (Freeform::getInstance()->settings->getSettingsModel()->listBuilderTemplates() as $path => $label) {
            $options->add($path, $label);
        }

        return $options;
    }
}
