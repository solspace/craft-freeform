<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Validator;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class LengthValidator extends Validator
{
    public function __construct(
        private int $length = 255,
        private string $message = 'Value contains {current} characters, {max} allowed.',
    ) {
    }

    public function validate(FieldInterface $field, mixed $value): bool
    {
        $currentLength = \strlen($value);

        if ($currentLength <= $this->length) {
            return true;
        }

        $message = StringHelper::replaceValues(
            $this->message,
            [
                'current' => $currentLength,
                'max' => $this->length,
            ]
        );

        $field->addError($message);

        return false;
    }
}
