<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Composer\Components\FieldInterface;

interface ValidatorInterface
{
    public function validate(FieldInterface $field, mixed $value): bool;
}
