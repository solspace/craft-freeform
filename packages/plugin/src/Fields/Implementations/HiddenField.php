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
    iconPath: __DIR__.'/Icons/hidden.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/text.ejs',
)]
class HiddenField extends TextField implements NoRenderInterface
{
    public function getType(): string
    {
        return self::TYPE_HIDDEN;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('value', $this->getValue())
        ;

        return '<input'.$attributes.' />';
    }
}
