<?php

namespace Solspace\Freeform\Attributes\Property;

interface DefaultValueGeneratorInterface extends ValueGeneratorInterface
{
    public function generateDefaultValue(mixed $value): mixed;
}
