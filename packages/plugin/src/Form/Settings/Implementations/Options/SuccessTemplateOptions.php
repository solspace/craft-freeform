<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Options\OptionFetcherInterface;

class SuccessTemplateOptions implements OptionFetcherInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        return new OptionCollection();
    }
}
