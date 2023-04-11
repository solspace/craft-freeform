<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes;

use Solspace\Freeform\Attributes\Property\Property;

interface ValueGeneratorInterface
{
    public function generateValue(Property $property, ?object $referenceObject): mixed;
}
