<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Library\Helpers\StringHelper;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Length implements PropertyValidatorInterface
{
    public function __construct(
        private int $length = 255,
        private string $message = 'Value contains {current} characters, {max} allowed.',
    ) {}

    public function validate(mixed $value): array
    {
        $currentLength = \strlen($value);

        if ($currentLength <= $this->length) {
            return [];
        }

        $message = StringHelper::replaceValues(
            $this->message,
            [
                'current' => $currentLength,
                'max' => $this->length,
            ]
        );

        return [$message];
    }
}
