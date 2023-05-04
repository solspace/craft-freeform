<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Commons\Helpers\ColorHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class RandomColorGenerator implements ValueGeneratorInterface
{
    public function generateValue(Property $property, ?object $referenceObject): string
    {
        return ColorHelper::randomColor();
    }
}
