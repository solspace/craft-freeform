<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;

#[Type(
    name: 'Calculation',
    typeShorthand: 'calculation',
    iconPath: __DIR__.'/../Icons/calculator.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/calculation.ejs',
)]
class CalculationField extends TextField
{
    private const DEFAULT_CALCULATIONS = '';

    protected string $instructions = '';
    protected string $placeholder = '';

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

    public function getType(): string
    {
        return self::TYPE_TEXT;
    }

    public function getCalculations(): string
    {
        return $this->calculations;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('value', $this->getValue())
            ->replace('data-calculations', $this->getCalculations())
        ;

        return '<input'.$attributes.' readonly />';
    }
}
