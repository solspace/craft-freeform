<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Freeform;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Handle implements PropertyValidatorInterface
{
    public function __construct(
        private string $message = 'Value is not a valid handle.',
    ) {}

    public function validate(mixed $value): array
    {
        $regex = '/^[a-zA-Z_0-9]+$/';

        if (Freeform::getInstance()->settings->getSettingsModel()->allowDashesInFieldHandles) {
            $regex = '/^[a-zA-Z\-_0-9]+$/';
        }

        $errors = [];
        if (!preg_match($regex, $value)) {
            $errors[] = Freeform::t($this->message);
        }

        return $errors;
    }
}
