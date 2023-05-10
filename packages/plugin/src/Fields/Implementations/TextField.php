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
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Symfony\Component\Serializer\Annotation\Ignore;

/**
 * @extends AbstractField<string>
 */
#[Type(
    name: 'Text',
    typeShorthand: 'text',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class TextField extends AbstractField implements PlaceholderInterface
{
    use PlaceholderTrait;

    #[Ignore]
    protected string $customInputType;

    public function getType(): string
    {
        return self::TYPE_TEXT;
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->customInputType ?? 'text')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
        ;

        return '<input'.$attributes.' />';
    }
}
