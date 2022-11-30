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

use Solspace\Freeform\Attributes\Field\Property;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\LengthConstraint;

#[Type(
    name: 'Textarea',
    typeShorthand: 'textarea',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class TextareaField extends TextField implements SingleValueInterface, PlaceholderInterface
{
    #[Property(
        instructions: 'The number of rows in height for this field.',
    )]
    protected int $rows = 2;

    public function getType(): string
    {
        return self::TYPE_TEXTAREA;
    }

    public function getRows(): ?int
    {
        return $this->rows;
    }

    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new LengthConstraint(
            null,
            65535,
            $this->translate('The allowed maximum length is {{max}} characters. Current size is {{difference}} characters too long.')
        );

        return $constraints;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<textarea '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getAttributeString('rows', $this->getRows())
            .$this->getNumericAttributeString('maxlength', $this->getMaxLength())
            .$this->getRequiredAttribute()
            .$attributes->getInputAttributesAsString()
            .$this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            .'>'
            .htmlentities($this->getValue())
            .'</textarea>';
    }
}
