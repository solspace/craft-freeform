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
use Solspace\Freeform\Fields\Interfaces\BooleanInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Twig\Markup;

/**
 * @extends AbstractField<boolean>
 */
#[Type(
    name: 'Checkbox',
    typeShorthand: 'checkbox',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class CheckboxField extends AbstractField implements InputOnlyInterface, BooleanInterface
{
    #[Property('Checked by default')]
    protected bool $checkedByDefault = false;

    public function getType(): string
    {
        return self::TYPE_CHECKBOX;
    }

    public function isChecked(): bool
    {
        return $this->value;
    }

    public function isCheckedByDefault(): bool
    {
        return $this->checkedByDefault;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(mixed $value): self
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
