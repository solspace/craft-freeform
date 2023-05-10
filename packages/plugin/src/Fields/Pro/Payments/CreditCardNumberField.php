<?php

namespace Solspace\Freeform\Fields\Pro\Payments;

use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;

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

    public function getIdAttribute(): string
    {
        return $this->getCustomAttributes()->getId();
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $classString = $attributes->getClass().' '.$this->getInputClassString();
        $handle = $this->getHandle();
        $id = $this->getIdAttribute();

        return '<div '
            .$this->getAttributeString('name', $handle)
            .$this->getAttributeString('id', $id)
            .$this->getAttributeString('class', $classString)
            .$this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            .$this->getRequiredAttribute()
            .$attributes->getInputAttributesAsString()
            .'></div>';
    }
}
