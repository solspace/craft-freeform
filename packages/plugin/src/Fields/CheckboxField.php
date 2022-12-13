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

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Twig\Markup;

#[Type(
    name: 'Checkbox',
    typeShorthand: 'checkbox',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class CheckboxField extends AbstractField implements SingleValueInterface, InputOnlyInterface
{
    #[Property('Checked by default')]
    protected bool $checkedByDefault = false;

    protected bool $value = false;

    public function getType(): string
    {
        return self::TYPE_CHECKBOX;
    }

    public function isChecked(): bool
    {
        return $this->value;
    }

    public function getValue(): string
    {
        return $this->value ? $this->getDefaultValue() : '';
    }

    public function setValue(mixed $value): FieldInterface
    {
        $this->value = (bool) $value;

        return $this;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();

        $output = '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', FieldInterface::TYPE_HIDDEN)
            .$this->getAttributeString('value', '')
            .$attributes->getInputAttributesAsString()
            .'/>';

        $output .= $this->getSingleInputHtml();

        return $output;
    }

    public function getSingleInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', $this->getType())
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getAttributeString('value', $this->getDefaultValue())
            .$this->getParameterString('checked', (bool) $this->getValue())
            .$this->getRequiredAttribute()
            .$attributes->getInputAttributesAsString()
            .'/>';
    }

    public function renderSingleInput(): Markup
    {
        return $this->renderRaw($this->getSingleInputHtml());
    }

    protected function onBeforeInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addLabelAttribute('class', $attributes->getLabelClass());

        return '<label'
            .$this->getLabelAttributesString()
            .'>';
    }

    protected function onAfterInputHtml(): string
    {
        $output = $this->getLabel();
        $output .= '</label>';

        return $output;
    }
}
