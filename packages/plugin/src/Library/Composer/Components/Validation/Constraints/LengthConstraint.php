<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class LengthConstraint implements ConstraintInterface
{
    /** @var int */
    private $min;

    /** @var int */
    private $max;

    /** @var string */
    private $messageMax;

    /** @var string */
    private $messageMin;

    /** @var string */
    private $messageMinMax;

    /**
     * NumericConstraint constructor.
     *
     * @param int    $min
     * @param int    $max
     * @param string $messageMax
     * @param string $messageMin
     * @param string $messageMinMax
     */
    public function __construct(
        $min = null,
        $max = null,
        $messageMax = 'The value must be no more than {{max}} characters',
        $messageMin = 'The value must be no less than {{min}} characters',
        $messageMinMax = 'The value must be between {{min}} and {{max}} characters'
    ) {
        $this->min = $min > 0 ? (int) $min : null;
        $this->max = $max > 0 ? (int) $max : null;
        $this->messageMax = $messageMax;
        $this->messageMin = $messageMin;
        $this->messageMinMax = $messageMinMax;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value): ConstraintViolationList
    {
        $violationList = new ConstraintViolationList();

        $length = \strlen($value);
        $minEnabled = null !== $this->min;
        $maxEnabled = null !== $this->max;

        if ($minEnabled && !$maxEnabled && $length < $this->min) {
            $message = str_replace(
                ['{{min}}', '{{length}}', '{{difference}}'],
                [$this->min, $length, $this->min - $length],
                $this->messageMin
            );
            $violationList->addError($message);
        } elseif ($maxEnabled && !$minEnabled && $length > $this->max) {
            $message = str_replace(
                ['{{max}}', '{{length}}', '{{difference}}'],
                [$this->max, $length, $length - $this->max],
                $this->messageMax
            );
            $violationList->addError($message);
        } elseif ($minEnabled && $maxEnabled && ($length < $this->min || $length > $this->max)) {
            $message = str_replace(
                ['{{min}}', '{{max}}', '{{length}}'],
                [$this->min, $this->max, $length],
                $this->messageMinMax
            );
            $violationList->addError($message);
        }

        return $violationList;
    }
}
