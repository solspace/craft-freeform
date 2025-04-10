<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Freeform;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Handle implements PropertyValidatorInterface
{
    private string $pattern;

    public function __construct(
        private string $message = 'Value is not a valid handle.',
    ) {
        $pattern = '/^[a-zA-Z_0-9]+$/u';
        if (Freeform::getInstance()->settings->getSettingsModel()->allowDashesInFieldHandles) {
            $pattern = '/^[a-zA-Z\-_0-9]+$/u';
        }

        $this->pattern = $pattern;
    }

    public function validate(mixed $value): array
    {
        $errors = [];
        if (!preg_match($this->pattern, $value)) {
            $errors[] = Freeform::t($this->message);
        }

        return $errors;
    }
}
