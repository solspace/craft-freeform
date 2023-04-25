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
use Solspace\Freeform\Fields\AbstractExternalOptionsField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OneLineInterface;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Fields\Traits\OneLineTrait;

#[Type(
    name: 'Checkbox Group',
    typeShorthand: 'checkbox-group',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class CheckboxGroupField extends AbstractExternalOptionsField implements MultiValueInterface, OneLineInterface
{
    use MultipleValueTrait;
    use OneLineTrait;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_CHECKBOX_GROUP;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('type', 'checkbox')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('value', $this->getValue())
        ;

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            $inputAttributes = $attributes
                ->clone()
                ->replace('id', $this->getIdAttribute().'-'.$index)
                ->replace('value', $option->value)
                ->replace('checked', $option->checked)
            ;

            $output .= '<label>';
            $output .= '<input'.$inputAttributes.' />';
            $output .= $this->translate($option->label);
            $output .= '</label>';
        }

        return $output;
    }

    public function getValueAsString(bool $optionsAsValues = true): string
    {
        if (!$optionsAsValues) {
            return implode(', ', $this->getValue());
        }

        $labels = [];
        foreach ($this->getOptions() as $option) {
            if ($option->isChecked()) {
                $labels[] = $option->getLabel();
            }
        }

        return implode(', ', $labels);
    }

    /**
     * {@inheritDoc}
     */
    protected function onBeforeInputHtml(): string
    {
        return $this->isOneLine() ? '<div class="input-group-one-line">' : '';
    }

    /**
     * {@inheritDoc}
     */
    protected function onAfterInputHtml(): string
    {
        return $this->isOneLine() ? '</div>' : '';
    }
}
