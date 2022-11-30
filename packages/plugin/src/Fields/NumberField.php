<?php

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Attributes\Field\Property;
use Solspace\Freeform\Attributes\Field\PropertyGroup;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\LengthConstraint;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\NumericConstraint;

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
        placeholder: 'Min',
    )]
    #[PropertyGroup(
        'length',
        label: 'Min/Max Length',
        instructions: 'The minimum and/or maximum character length this field is allowed to have (optional).',
    )]
    protected ?int $minLength = null;

    #[Property(
        label: 'Max',
    )]
    #[PropertyGroup('length')]
    protected ?int $maxLength = null;

    #[Property(
        placeholder: 'Max',
    )]
    #[PropertyGroup(
        'value',
        label: 'Min/Max Values',
        instructions: 'The minimum and/or maximum numeric value this field is allowed to have (optional).',
    )]
    protected ?int $minValue = null;

    #[Property(
        placeholder: 'Max'
    )]
    #[PropertyGroup('value')]
    protected ?int $maxValue = null;

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

    public function getType(): string
    {
        return self::TYPE_NUMBER;
    }

    public function getMinLength(): int
    {
        return $this->minLength;
    }

    public function getMinValue(): int
    {
        return $this->minValue;
    }

    public function getMaxValue(): int
    {
        return $this->maxValue;
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
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass().' '.$this->getInputClassString());

        $output = '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', 'number')
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getNumericAttributeString('maxlength', $this->getMaxLength())
            .$this->getNumericAttributeString('min', $this->getMinValue())
            .$this->getNumericAttributeString('max', $this->getMaxValue())
            .$this->getAttributeString('step', $this->getStep())
            .$this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            .$this->getAttributeString('value', $this->getValue())
            .$this->getRequiredAttribute();

        $output .= $attributes->getInputAttributesAsString();
        $output .= '/>';

        return $output;
    }
}
