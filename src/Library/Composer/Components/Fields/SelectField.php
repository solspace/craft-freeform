<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\OptionsTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;

class SelectField extends AbstractField implements SingleValueInterface, OptionsInterface
{
    use SingleValueTrait;
    use OptionsTrait;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_SELECT;
    }

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();

        $output = '<select '
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getAttributeString('class', $attributes->getClass())
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
