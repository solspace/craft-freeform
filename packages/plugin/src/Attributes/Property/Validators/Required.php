<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Freeform;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Required implements PropertyValidatorInterface
{
    public function __construct(
        private string $message = 'This value is required.',
    ) {
    }

    public function validate(mixed $value): array
    {
        $errors = [];
        if (empty($value)) {
            $errors[] = Freeform::t($this->message);
        }

        return $errors;
    }
}
