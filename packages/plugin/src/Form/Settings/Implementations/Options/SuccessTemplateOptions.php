<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionFetcherInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

class SuccessTemplateOptions implements OptionFetcherInterface
{
    public function fetchOptions(Form $form, Property $property): OptionCollection
    {
        return new OptionCollection();
    }
}
