<?php

namespace Solspace\Freeform\Attributes\Property;

interface ValueGeneratorInterface
{
    public function generateValue(Property $property, ?object $referenceObject): mixed;
}
