<?php

namespace Solspace\Freeform\Library\Composer\Components\Validation\Constraints;

use Solspace\Freeform\Library\Composer\Components\Validation\Errors\ConstraintViolationList;

class NumericConstraint implements ConstraintInterface
{
    /** @var int */
    private $min;

    /** @var int */
    private $max;

    /** @var int */
    private $decimalCount;

    /** @var bool */
    private $allowNegativeNumbers;

    /** @var string */
    private $message;

    /** @var string */
    private $messageMax;

    /** @var string */
    private $messageMin;

    /** @var string */
    private $messageMinMax;

    /** @var string */
    private $messageDecimals;

    /** @var string */
    private $messageNegative;

    /**
     * NumericConstraint constructor.
     *
     * @param int    $min
     * @param int    $max
     * @param int    $decimalCount
     * @param bool   $allowNegativeNumbers
     * @param string $message
     * @param string $messageMax
     * @param string $messageMin
     * @param string $messageMinMax
     * @param string $messageDecimals
     * @param string $messageNegative
     */
    public function __construct(
        $min = null,
        $max = null,
        $decimalCount = null,
        $allowNegativeNumbers = false,
        $message = 'Value must be numeric',
        $messageMax = 'The value must be no more than {{max}}',
        $messageMin = 'The value must be no less than {{min}}',
        $messageMinMax = 'The value must be between {{min}} and {{max}}',
        $messageDecimals = '{{dec}} decimal places allowed',
        $messageNegative = 'Only positive numbers allowed'
    ) {
        $this->min = $min > 0 ? (int) $min : null;
        $this->max = $max > 0 ? (int) $max : null;
        $this->decimalCount = $decimalCount > 0 ? (int) $decimalCount : null;
        $this->allowNegativeNumbers = (bool) $allowNegativeNumbers;
        $this->message = $message;
        $this->messageMax = $messageMax;
        $this->messageMin = $messageMin;
        $this->messageMinMax = $messageMinMax;
        $this->messageDecimals = $messageDecimals;
        $this->messageNegative = $messageNegative;
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value)
    {
        $violationList = new ConstraintViolationList();

        $pattern = '/^-?\\d*((?:\\.|,)\\d+)?$/';

        if (!preg_match($pattern, $value, $matches)) {
            $violationList->addError($this->message);

            return $violationList;
        }

        // If there are decimals specified
        if (isset($matches[2])) {
            if (null !== $this->decimalCount) {
                $decimals = substr($matches[2], 1);

                if (\strlen($decimals) > $this->decimalCount) {
                    $message = str_replace('{{dec}}', $this->decimalCount, $this->messageDecimals);
                    $violationList->addError($message);
                }
            } else {
                $message = str_replace('{{dec}}', 0, $this->messageDecimals);
                $violationList->addError($message);
            }
        }

        $numericValue = str_replace(',', '.', $value);
        $numericValue = preg_replace('/[^0-9\\-\\.]/', '', $numericValue);

        if (!$this->allowNegativeNumbers && $numericValue < 0) {
            $violationList->addError($this->messageNegative);
        }

        $minEnabled = null !== $this->min;
        $maxEnabled = null !== $this->max;

        if ($minEnabled && !$maxEnabled && $numericValue < $this->min) {
            $message = str_replace('{{min}}', $this->min, $this->messageMin);
            $violationList->addError($message);
        } elseif ($maxEnabled && !$minEnabled && $numericValue > $this->max) {
            $message = str_replace('{{max}}', $this->max, $this->messageMax);
            $violationList->addError($message);
        } elseif ($minEnabled && $maxEnabled && ($numericValue < $this->min || $numericValue > $this->max)) {
            $message = str_replace(
                ['{{min}}', '{{max}}'],
                [$this->min, $this->max],
                $this->messageMinMax
            );
            $violationList->addError($message);
        }

        return $violationList;
    }
}
