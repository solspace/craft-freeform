<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class IconName implements PropertyValidatorInterface
{
    public function validate(mixed $value): array
    {
        if (null === $value || '' === $value || (\is_string($value) && preg_match('/^[a-z0-9-]{1,100}$/D', $value))) {
            return [];
        }

        return ['Choose a valid form icon.'];
    }
}
