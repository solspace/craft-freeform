<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Form\Form;

interface ValueGeneratorInterface
{
    public function generateValue(Form $form, Property $property): mixed;
}
