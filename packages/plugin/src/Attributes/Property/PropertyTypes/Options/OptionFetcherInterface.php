<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes\Options;

use Solspace\Freeform\Attributes\Property\Property;

interface OptionFetcherInterface
{
    public function fetchOptions(Property $property): OptionCollection;
}
