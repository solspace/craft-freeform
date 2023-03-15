<?php

namespace Solspace\Freeform\Attributes\Property;

interface PropertyValidatorInterface
{
    /**
     * Validate a value and return a list of error messages.
     */
    public function validate(mixed $value): array;
}
