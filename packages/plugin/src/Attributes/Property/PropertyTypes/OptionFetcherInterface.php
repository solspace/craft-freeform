<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Composer\Components\Form;

interface OptionFetcherInterface
{
    public function fetchOptions(Form $form, Property $property): OptionCollection;
}
