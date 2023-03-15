<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Freeform;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Handle implements PropertyValidatorInterface
{
    public function __construct(
        private string $message = 'Value is not a valid handle.',
    ) {
    }

    public function validate(mixed $value): array
    {
        $errors = [];
        if (!preg_match('/^[a-zA-Z\-_0-9]+$/', $value)) {
            $errors[] = Freeform::t($this->message);
        }

        return $errors;
    }
}
