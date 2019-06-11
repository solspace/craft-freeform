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

use Solspace\Freeform\Library\Composer\Components\Fields\AbstractExternalOptionsField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OneLineInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\OneLineTrait;

class CheckboxGroupField extends AbstractExternalOptionsField implements MultipleValueInterface, OneLineInterface
{
    use MultipleValueTrait;
    use OneLineTrait;

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
     * @inheritDoc
     */
    protected function onBeforeInputHtml(): string
    {
        return $this->isOneLine() ? '<div class="input-group-one-line">' : '';
    }

    /**
     * @inheritDoc
     */
    protected function onAfterInputHtml(): string
    {
        return $this->isOneLine() ? '</div>' : '';
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

        $output = '';
        foreach ($this->getOptions() as $index => $option) {
            $output .= '<label>';

            $output .= '<input '
                . $this->getInputAttributesString()
                . $this->getAttributeString('name', $this->getHandle() . '[]')
                . $this->getAttributeString('type', 'checkbox')
                . $this->getAttributeString('id', $this->getIdAttribute() . "-$index")
                . $this->getAttributeString('value', $option->getValue())
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
