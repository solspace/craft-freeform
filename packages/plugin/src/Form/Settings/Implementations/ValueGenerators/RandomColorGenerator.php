<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Commons\Helpers\ColorHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\ValueGeneratorInterface;
use Solspace\Freeform\Form\Form;

class RandomColorGenerator implements ValueGeneratorInterface
{
    public function generateValue(Form $form, Property $property): string
    {
        return ColorHelper::randomColor();
    }
}
