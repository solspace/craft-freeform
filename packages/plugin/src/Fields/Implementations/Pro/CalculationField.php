<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\FieldAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Calculation',
    typeShorthand: 'calculation',
    iconPath: __DIR__.'/../Icons/calculator.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/calculation.ejs',
)]
class CalculationField extends TextField
{
    public const PLAIN_TEXT = 'plainText';
    public const REGULAR_TEXT_INPUT = 'regularTextInput';
    public const READ_ONLY_TEXT_INPUT = 'readOnlyTextInput';
    public const HIDDEN = 'hidden';

    protected string $instructions = '';
    protected string $placeholder = '';

    #[Input\Select(
        label: 'Appearance',
        instructions: 'Use plain text or regular text or read only text or hide the field.',
        order: 0,
        options: [
            self::PLAIN_TEXT => 'Plain text',
            self::REGULAR_TEXT_INPUT => 'Regular text input',
            self::READ_ONLY_TEXT_INPUT => 'Read only text input',
            self::HIDDEN => 'Hidden',
        ],
    )]
    #[ValueTransformer(FieldAttributesTransformer::class)]
    protected FieldAttributesCollection $attributes;

    public function getType(): string
    {
        return self::TYPE_CALCULATION;
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
        ;

        return '<input'.$attributes.' />';
    }
}
