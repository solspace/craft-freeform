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

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;

class TextField extends AbstractField implements SingleValueInterface, PlaceholderInterface
{
    use PlaceholderTrait;
    use SingleValueTrait;

    /** @var int */
    protected $maxLength;

    /** @var string */
    protected $customInputType;

    public static function getSvgIcon(): ?string
    {
        return file_get_contents(__DIR__.'/Icons/text.svg');
    }

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_TEXT;
    }

    /**
     * @return null|int
     */
    public function getMaxLength()
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
