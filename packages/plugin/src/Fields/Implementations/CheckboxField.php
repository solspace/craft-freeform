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
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
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
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', FieldInterface::TYPE_HIDDEN)
            ->setIfEmpty('value', '')
        ;

        $output = '<input '.$attributes.' />';
        $output .= $this->getSingleInputHtml();

        return $output;
    }

    public function getSingleInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('value', $this->getDefaultValue())
            ->setIfEmpty('checked', (bool) $this->getValue())
            ->setIfEmpty($this->getRequiredAttribute())
        ;

        return '<input '.$attributes.' />';
    }

    public function renderSingleInput(): Markup
    {
        return $this->renderRaw($this->getSingleInputHtml());
    }

    protected function onBeforeInputHtml(): string
    {
        return '<label'.$this->attributes->getLabel().'>';
    }

    protected function onAfterInputHtml(): string
    {
        $output = $this->getLabel();
        $output .= '</label>';

        return $output;
    }
}
