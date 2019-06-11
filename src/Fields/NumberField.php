<?php

namespace Solspace\Freeform\Fields;

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
     * @return mixed|string|null
     */
    public function getValue()
    {
        $value = $this->value;
        $value = str_replace(',', '.', $value);
        if (is_numeric($value)) {
            $value += 0;
        }

        return $value;
    }

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
     * @deprecated no longer used
     */
    public function getDecimalSeparator(): string
    {
        return $this->decimalSeparator;
    }

    /**
     * @return string
     * @deprecated no longer used
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

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass() . ' ' . $this->getInputClassString());

        $output = '<input '
            . $this->getInputAttributesString()
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('type', 'number')
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getAttributeString('lang', 'en')
            . $this->getNumericAttributeString('maxlength', $this->getMaxLength())
            . $this->getNumericAttributeString('min', $this->getMinValue())
            . $this->getNumericAttributeString('max', $this->getMaxValue())
            . $this->getAttributeString('step', $this->getStep())
            . $this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            . $this->getAttributeString('value', $this->getValue())
            . $this->getRequiredAttribute();

        $output .= $attributes->getInputAttributesAsString();
        $output .= '/>';

        return $output;
    }

    /**
     * @return float
     */
    private function getStep(): float
    {
        return 1 / (10 ** $this->getDecimalCount());
    }
}
