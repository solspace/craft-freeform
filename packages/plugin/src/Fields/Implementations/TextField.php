<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;

#[Type(
    name: 'Text',
    typeShorthand: 'text',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class TextField extends AbstractField implements SingleValueInterface, PlaceholderInterface
{
    use PlaceholderTrait;
    use SingleValueTrait;

    protected string $customInputType;

    public function getType(): string
    {
        return self::TYPE_TEXT;
    }

    public function getMaxLength(): ?int
    {
        return $this->maxLength;
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass().' '.$this->getInputClassString());

        return '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', $this->customInputType ?? 'text')
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getNumericAttributeString('maxlength', $this->getMaxLength())
            .$this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            .$this->getAttributeString('value', $this->getValue())
            .$this->getRequiredAttribute()
            .$attributes->getInputAttributesAsString()
            .'/>';
    }
}
