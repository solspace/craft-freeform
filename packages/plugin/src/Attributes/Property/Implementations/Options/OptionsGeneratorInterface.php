<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;

interface OptionsGeneratorInterface
{
    public function fetchOptions(Property $property): OptionCollection;
}
