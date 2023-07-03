<?php

namespace Solspace\Freeform\Fields\Validation\Constraints;

use Solspace\Freeform\Fields\Validation\Errors\ConstraintViolationList;

class NumericConstraint implements ConstraintInterface
{
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
        private ?int $min = null,
        private ?int $max = null,
        private ?int $decimalCount = null,
        private ?bool $allowNegativeNumbers = false,
        private ?string $message = 'Value must be numeric',
        private ?string $messageMax = 'The value must be no more than {{max}}',
        private ?string $messageMin = 'The value must be no less than {{min}}',
        private ?string $messageMinMax = 'The value must be between {{min}} and {{max}}',
        private ?string $messageDecimals = '{{dec}} decimal places allowed',
        private ?string $messageNegative = 'Only positive numbers allowed'
    ) {
    }

    /**
     * {@inheritDoc}
     */
    public function validate($value): ConstraintViolationList
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
        if ('' === $numericValue) {
            return $violationList;
        }

        $numericValue = (float) $numericValue;

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
