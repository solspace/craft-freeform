<?php

namespace Solspace\Freeform\Fields\Validation;

use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Validation\Errors\ConstraintViolationList;

class Validator
{
    public function validate(AbstractField $field, mixed $value): ConstraintViolationList
    {
        $violationList = new ConstraintViolationList();

        $constraints = $field->getConstraints();
        foreach ($constraints as $constraint) {
            $violationList->merge($constraint->validate($value));
        }

        return $violationList;
    }
}
