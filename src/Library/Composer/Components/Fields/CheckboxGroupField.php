<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\MultipleValueTrait;

class CheckboxGroupField extends AbstractExternalOptionsField implements MultipleValueInterface
{
    use MultipleValueTrait;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_CHECKBOX_GROUP;
    }

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $output     = '';

        foreach ($this->options as $index => $option) {
            $output .= '<label>';

            $output .= '<input '
                . $this->getAttributeString('name', $this->getHandle() . '[]')
                . $this->getAttributeString('type', 'checkbox')
                . $this->getAttributeString('id', $this->getIdAttribute() . "-$index")
                . $this->getAttributeString('class', $attributes->getClass())
                . $this->getAttributeString('value', $option->getValue(), false)
                . $this->getParameterString('checked', $option->isChecked())
                . $attributes->getInputAttributesAsString()
                . '/>';
            $output .= $this->translate($option->getLabel());
            $output .= '</label>';
        }

        return $output;
    }

    /**
     * @param bool $optionsAsValues
     *
     * @return string
     */
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
}
