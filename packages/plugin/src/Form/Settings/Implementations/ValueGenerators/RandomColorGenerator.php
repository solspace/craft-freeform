<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Library\Helpers\ColorHelper;

class RandomColorGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): string
    {
        return ColorHelper::randomColor();
    }
}
