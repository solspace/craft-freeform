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

#[Type(
    name: 'Select',
    typeShorthand: 'select',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class SelectField extends AbstractExternalOptionsField
{
    public function getType(): string
    {
        return self::TYPE_SELECT;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->set($this->getRequiredAttribute())
        ;

        $output = '<select'.$attributes.'>';
        foreach ($this->getOptions() as $option) {
            $output .= '<option value="'.$option->value.'"'.($option->checked ? ' selected' : '').'>';
            $output .= $this->translate($option->label);
            $output .= '</option>';
        }
        $output .= '</select>';

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
}
