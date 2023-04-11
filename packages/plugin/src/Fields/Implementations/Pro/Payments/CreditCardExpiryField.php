<?php

namespace Solspace\Freeform\Fields\Implementations\Pro\Payments;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;

#[Type(
    name: 'Credit Card: expiry',
    typeShorthand: 'cc-expiry',
    iconPath: __DIR__.'/../../Icons/text.svg',
)]
class CreditCardExpiryField extends TextField implements ExtraFieldInterface
{
    public const FIELD_NAME = 'CreditCardExpDate';

    public function getType(): string
    {
        return self::TYPE_CREDIT_CARD_EXPIRY;
    }

    public function isRequired(): bool
    {
        return true;
    }

    public function getIdAttribute(): string
    {
        return $this->getCustomAttributes()->getId();
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
