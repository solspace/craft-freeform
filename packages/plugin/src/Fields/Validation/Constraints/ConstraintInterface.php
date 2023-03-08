<?php

namespace Solspace\Freeform\Fields\Validation\Constraints;

use Solspace\Freeform\Fields\Validation\Errors\ConstraintViolationList;

interface ConstraintInterface
{
    /**
     * Validates the value against the constraint
     * Returns a ConstraintViolationList object.
     *
     * @param mixed $value
     *
     * @return ConstraintViolationList
     */
    public function validate($value);
}
