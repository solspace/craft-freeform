<?php

namespace Solspace\Freeform\Attributes\Property;

interface ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): mixed;
}
