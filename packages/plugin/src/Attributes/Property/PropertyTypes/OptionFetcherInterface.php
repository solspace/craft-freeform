<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes;

use Solspace\Freeform\Attributes\Property\Property;

interface OptionFetcherInterface
{
    public function fetchOptions(Property $property): OptionCollection;
}
