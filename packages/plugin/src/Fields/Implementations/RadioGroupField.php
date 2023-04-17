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
use Solspace\Freeform\Fields\Interfaces\OneLineInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\OneLineTrait;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;

#[Type(
    name: 'Radio Group',
    typeShorthand: 'radio-group',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class RadioGroupField extends AbstractExternalOptionsField implements SingleValueInterface, OneLineInterface
{
    use OneLineTrait;
    use SingleValueTrait;

    public function getType(): string
    {
        return self::TYPE_RADIO_GROUP;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'radio')
            ->set($this->getRequiredAttribute())
        ;

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            $inputAttributes = $attributes
                ->clone()
                ->replace('value', $option->value)
                ->replace('checked', $option->checked)
                ->replace('id', $this->getIdAttribute()."-{$index}")
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
            return $this->getValue();
        }

        foreach ($this->getOptions() as $option) {
            if ($option->isChecked()) {
                return $option->getLabel();
            }
        }

        return '';
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
