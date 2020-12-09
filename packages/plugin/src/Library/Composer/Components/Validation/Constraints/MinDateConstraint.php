<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Carbon\Carbon;
use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class MinDateConstraint implements ConstraintInterface
{
    /** @var string */
    private $message;

    /** @var string */
    private $format;

    /** @var string */
    private $minDate;

    /**
     * DateRangeConstraint constructor.
     */
    public function __construct(
        string $message,
        string $format,
        string $minDate = null
    ) {
        $this->message = $message;
        $this->format = $format;
        $this->minDate = $minDate;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value): ConstraintViolationList
    {
        $violationList = new ConstraintViolationList();

        if (!$this->minDate) {
            return $violationList;
        }

        $minDate = new Carbon($this->minDate);
        $minDate->setTime(0, 0, 0);

        try {
            $date = Carbon::createFromFormat($this->format, $value);

            if ($date->lt($minDate)) {
                $violationList->addError($this->message);
            }
        } catch (\InvalidArgumentException $e) {
        }

        return $violationList;
    }
}
