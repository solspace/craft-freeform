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
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;

#[Type(
    name: 'Hidden',
    typeShorthand: 'hidden',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class HiddenField extends TextField implements NoRenderInterface
{
    public function getType(): string
    {
        return self::TYPE_HIDDEN;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', $this->getType())
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getAttributeString('value', $this->getValue())
            .$attributes->getInputAttributesAsString()
            .'/>';
    }
}
