<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Fields\FieldInterface;

interface ValidatorInterface
{
    public function validate(FieldInterface $field, mixed $value): bool;
}
