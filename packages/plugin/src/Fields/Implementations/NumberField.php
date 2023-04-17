<?php

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\Validation\Constraints\NumericConstraint;

#[Type(
    name: 'Number',
    typeShorthand: 'number',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class NumberField extends TextField
{
    #[Property(
        label: 'Allow negative numbers?'
    )]
    protected bool $allowNegative = false;

    #[Property(
        label: 'Min/Max Values',
        instructions: 'The minimum and/or maximum numeric value this field is allowed to have (optional).',
        type: Property::TYPE_MIN_MAX,
    )]
    protected ?array $minMaxValues = [null, null];

    #[Property(
        instructions: 'The number of decimal places allowed.',
        placeholder: 'Leave blank for no decimals',
    )]
    protected ?int $decimalCount = 0;

    #[Property(
        instructions: 'The step',
    )]
    protected float $step = 1;

    public function getValue(): mixed
    {
        $value = parent::getValue();
        $value = str_replace(',', '.', $value);
        if (is_numeric($value)) {
            $value += 0;
        }

        return $value;
    }

    public function getMinMaxValues(): array
    {
        if (!\is_array($this->minMaxValues)) {
            return [null, null];
        }

        return $this->minMaxValues;
    }

    public function getType(): string
    {
        return self::TYPE_NUMBER;
    }

    public function getMinValue(): int
    {
        [$min] = $this->getMinMaxValues();

        return $min;
    }

    public function getMaxValue(): int
    {
        [, $max] = $this->getMinMaxValues();

        return $max;
    }

    public function getDecimalCount(): int
    {
        return $this->decimalCount;
    }

    public function isAllowNegative(): bool
    {
        return $this->allowNegative;
    }

    public function getStep(): float
    {
        return $this->step;
    }

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
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

        return $constraints;
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'number')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('min', $this->getMinValue())
            ->setIfEmpty('max', $this->getMaxValue())
            ->setIfEmpty('step', $this->getStep())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
            ->set($this->getRequiredAttribute())
        ;

        return '<input'.$attributes.' />';
    }
}
