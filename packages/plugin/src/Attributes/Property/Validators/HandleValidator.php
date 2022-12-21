<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\Validator;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class HandleValidator extends Validator
{
    public function __construct(
        private string $message = 'Value is not a valid handle.',
    ) {
    }

    public function validate(FieldInterface $field, mixed $value): bool
    {
        // TODO: implement handle validator logic
        $field->addError($this->message);

        return false;
    }
}
