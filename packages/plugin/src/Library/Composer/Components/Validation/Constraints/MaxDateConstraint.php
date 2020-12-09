<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Carbon\Carbon;
use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class MaxDateConstraint implements ConstraintInterface
{
    /** @var string */
    private $message;

    /** @var string */
    private $format;

    /** @var string */
    private $maxDate;

    /**
     * DateRangeConstraint constructor.
     */
    public function __construct(
        string $message,
        string $format,
        string $maxDate = null
    ) {
        $this->message = $message;
        $this->format = $format;
        $this->maxDate = $maxDate;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value): ConstraintViolationList
    {
        $violationList = new ConstraintViolationList();

        if (!$this->maxDate) {
            return $violationList;
        }

        $maxDate = new Carbon($this->maxDate);
        $maxDate->setTime(23, 59, 59);

        try {
            $date = Carbon::createFromFormat($this->format, $value);

            if ($date->gt($maxDate)) {
                $violationList->addError($this->message);
            }
        } catch (\InvalidArgumentException $e) {
        }

        return $violationList;
    }
}
