<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionFetcherInterface;
use Solspace\Freeform\Attributes\Property\Property;

class FormattingTemplateOptions implements OptionFetcherInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        return new OptionCollection();
    }
}
