<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\LengthConstraint;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\NumericConstraint;

class NumberField extends TextField
{
    /** @var int */
    protected $minLength;

    /** @var int */
    protected $minValue;

    /** @var int */
    protected $maxValue;

    /** @var int */
    protected $decimalCount;

    /** @var string */
    protected $decimalSeparator;

    /** @var string */
    protected $thousandsSeparator;

    /** @var bool */
    protected $allowNegative;

    /**
     * @inheritDoc
     */
    public function getType(): string
    {
        return self::TYPE_NUMBER;
    }

    /**
     * @return int
     */
    public function getMinLength(): int
    {
        return $this->minLength;
    }

    /**
     * @return int
     */
    public function getMinValue(): int
    {
        return $this->minValue;
    }

    /**
     * @return int
     */
    public function getMaxValue(): int
    {
        return $this->maxValue;
    }

    /**
     * @return int
     */
    public function getDecimalCount(): int
    {
        return $this->decimalCount;
    }

    /**
     * @return string
     */
    public function getDecimalSeparator(): string
    {
        return $this->decimalSeparator;
    }

    /**
     * @return string
     */
    public function getThousandsSeparator(): string
    {
        return $this->thousandsSeparator;
    }

    /**
     * @return bool
     */
    public function isAllowNegative(): bool
    {
        return $this->allowNegative;
    }

    /**
     * @inheritDoc
     */
    public function getConstraints(): array
    {
        $constraints   = parent::getConstraints();
        $constraints[] = new NumericConstraint(
            $this->getMinValue(),
            $this->getMaxValue(),
            $this->getDecimalCount(),
            $this->getDecimalSeparator(),
            $this->getThousandsSeparator(),
            $this->isAllowNegative(),
            $this->translate('Value must be numeric'),
            $this->translate('The value must be no more than {{max}}'),
            $this->translate('The value must be no less than {{min}}'),
            $this->translate('The value must be between {{min}} and {{max}}'),
            $this->translate('{{dec}} decimal places allowed'),
            $this->translate('Only positive numbers allowed')
        );
        $constraints[] = new LengthConstraint(
            $this->getMinLength(),
            $this->getMaxLength(),
            $this->translate('The value must be no more than {{max}} characters'),
            $this->translate('The value must be no less than {{min}} characters'),
            $this->translate('The value must be between {{min}} and {{max}} characters')
        );

        return $constraints;
    }
}
