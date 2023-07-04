<?php

namespace Solspace\Freeform\Attributes\Property;

interface ValueGeneratorInterface
{
    public function generateValue(Property $property, string $class, ?object $referenceObject): mixed;
}
