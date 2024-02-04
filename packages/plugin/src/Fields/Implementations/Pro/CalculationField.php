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
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;

#[Type(
    name: 'Calculation',
    typeShorthand: 'calculation',
    iconPath: __DIR__.'/../Icons/calculator.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/calculation.ejs',
)]
class CalculationField extends AbstractField implements PlaceholderInterface, DefaultValueInterface, EncryptionInterface
{
    use DefaultTextValueTrait;
    use EncryptionTrait;
    use PlaceholderTrait;

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

    public function getValue(): mixed
    {
        $value = parent::getValue();
        $value = str_replace(',', '.', $value);
        if (is_numeric($value)) {
            $value += 0;
        }

        return $value;
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
