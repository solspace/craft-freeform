<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;

#[Type(
    name: 'Calculation',
    typeShorthand: 'calculation',
    iconPath: __DIR__.'/../Icons/calculation.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/calculation.ejs',
)]
class CalculationField extends AbstractField implements DefaultValueInterface
{
    use DefaultTextValueTrait;

    private const DEFAULT_CALCULATIONS = '';

    private const INPUT_TYPE_REGULAR = 'regularTextInput';
    private const INPUT_TYPE_PLAIN = 'plainText';
    private const INPUT_TYPE_HIDDEN = 'hidden';

    protected string $instructions = '';

    #[Input\CalculationBox(
        label: 'Calculation Logic',
        instructions: 'Type "@" or "{" to get the field for calculation.',
        availableFieldTypes: [
            TextField::class,
            NumberField::class,
            TextareaField::class,
            DropdownField::class,
            RadiosField::class,
            HiddenField::class,
            InvisibleField::class,
            OpinionScaleField::class,
            RatingField::class,
            RegexField::class,
        ]
    )]
    protected string $calculations = self::DEFAULT_CALCULATIONS;

    #[Input\Select(
        options: [
            self::INPUT_TYPE_REGULAR => 'Regular Text Input',
            self::INPUT_TYPE_PLAIN => 'Plain Text',
            self::INPUT_TYPE_HIDDEN => 'Hidden',
        ],
    )]
    private string $inputType = self::INPUT_TYPE_REGULAR;

    public function getType(): string
    {
        return self::TYPE_CALCULATION;
    }

    public function getCalculations(): string
    {
        return $this->calculations;
    }

    public function getValue(): mixed
    {
        $value = parent::getValue();
        $value = str_replace(',', '.', $value);
        if (is_numeric($value)) {
            $value += 0;
        }

        return $value;
    }

    public function canRender(): bool
    {
        return self::INPUT_TYPE_HIDDEN !== $this->inputType;
    }

    public function getHtmlInputType(): string
    {
        return self::INPUT_TYPE_REGULAR === $this->inputType ? self::TYPE_TEXT : self::TYPE_HIDDEN;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('type', $this->getHtmlInputType())
            ->setIfEmpty('value', $this->getValue())
            ->replace('data-calculations', $this->getCalculations())
            ->replace('readonly', true)
        ;

        if (self::INPUT_TYPE_PLAIN === $this->inputType) {
            $output = '<div class="freeform-calculation-wrapper">';
            $output .= '<input'.$attributes.' />';
            $output .= '<p id="freeform-calculation-plain-field">'.$this->getValue().'</p>';
            $output .= '</div>';

            return $output;
        }

        return '<input'.$attributes.' />';
    }
}
