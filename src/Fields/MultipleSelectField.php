<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\AbstractExternalOptionsField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\OptionsTrait;

class MultipleSelectField extends AbstractExternalOptionsField implements MultipleValueInterface
{
    use MultipleValueTrait;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_MULTIPLE_SELECT;
    }

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        $output = '<select '
            . $this->getInputAttributesString()
            . $this->getAttributeString('name', $this->getHandle() . '[]')
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getParameterString('multiple', true)
            . $attributes->getInputAttributesAsString()
            . $this->getRequiredAttribute()
            . '>';

        foreach ($this->getOptions() as $option) {
            $output .= '<option value="' . $option->getValue() . '"' . ($option->isChecked() ? ' selected' : '') . '>';
            $output .= $this->translate($option->getLabel());
            $output .= '</option>';
        }

        $output .= '</select>';

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
