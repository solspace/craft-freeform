<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Carbon\Carbon;
use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class MaxDateConstraint implements ConstraintInterface
{
    /** @var string */
    private $message;

    /** @var string */
    private $maxDate;

    /**
     * DateRangeConstraint constructor.
     *
     * @param string      $message
     * @param string|null $maxDate
     */
    public function __construct(string $message, string $maxDate = null)
    {
        $this->message = $message;
        $this->maxDate = $maxDate;
    }

    /**
     * @inheritDoc
     */
    public function validate($value): ConstraintViolationList
    {
        $violationList = new ConstraintViolationList();

        if (!$this->maxDate) {
            return $violationList;
        }

        $maxDate = new Carbon($this->maxDate);
        $maxDate->setTime(23, 59, 59);

        $date = new Carbon($value);

        if ($date->gt($maxDate)) {
            $violationList->addError($this->message);
        }

        return $violationList;
    }
}
