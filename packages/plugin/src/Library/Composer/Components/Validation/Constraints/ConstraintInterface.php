<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

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
