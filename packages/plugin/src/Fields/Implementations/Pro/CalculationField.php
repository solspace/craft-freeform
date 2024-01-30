<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\TextField;

#[Type(
    name: 'Calculation',
    typeShorthand: 'calculation',
    iconPath: __DIR__.'/../Icons/calculator.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/calculation.ejs',
)]
class CalculationField extends TextField
{
    public const DEFAULT_CALCULATIONS = '';
    protected string $instructions = '';
    protected string $placeholder = '';

    #[Input\CalculationBox(
        label: 'Calculation Logic',
        instructions: 'Type "@" or "{" to get the field for calculation.',
    )]
    protected string $calculations = self::DEFAULT_CALCULATIONS;

    public function getType(): string
    {
        return self::TYPE_CALCULATION;
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
            ->setIfEmpty('data-calculations', $this->getCalculations())
        ;

        return '<input'.$attributes.' readonly />';
    }
}
