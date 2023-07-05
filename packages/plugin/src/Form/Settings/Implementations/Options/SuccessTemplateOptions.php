<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class SuccessTemplateOptions implements OptionsGeneratorInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        return new OptionCollection();
    }
}
