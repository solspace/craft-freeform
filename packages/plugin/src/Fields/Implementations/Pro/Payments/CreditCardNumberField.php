<?php

namespace Solspace\Freeform\Fields\Implementations\Pro\Payments;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;

#[Type(
    name: 'Credit Card: Number',
    typeShorthand: 'cc-number',
    iconPath: __DIR__.'/../../Icons/text.svg',
)]
class CreditCardNumberField extends TextField implements ExtraFieldInterface
{
    public const FIELD_NAME = 'CreditCardNumber';

    public function getType(): string
    {
        return self::TYPE_CREDIT_CARD_NUMBER;
    }

    public function isRequired(): bool
    {
        return true;
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getAttributes()->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->set($this->getRequiredAttribute())
        ;

        return '<div'.$attributes.'></div>';
    }
}
