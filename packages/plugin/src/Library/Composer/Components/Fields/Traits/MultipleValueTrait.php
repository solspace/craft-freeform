<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Fields\DynamicRecipientField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultiDimensionalValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;

trait MultipleValueTrait
{
    /** @var array */
    protected $values;

    /**
     * @return array
     */
    public function getValue()
    {
        $valueOverride = $this->getValueOverride();
        if ($valueOverride) {
            if (!\is_array($valueOverride)) {
                return [$valueOverride];
            }

            return $valueOverride;
        }

        $values = $this->values;

        if (!\is_array($values) && !empty($values)) {
            $values = [$values];
        }

        if (empty($values)) {
            $values = [];
        } elseif (!$this instanceof MultiDimensionalValueInterface) {
            $values = array_map('strval', $values);
            // $values = array_map([LitEmoji::class, 'shortcodeToUnicode'], $values);
        }

        if ($this instanceof DynamicRecipientField && $values) {
            $areIndexes = true;
            foreach ($values as $value) {
                if (!is_numeric($value)) {
                    $areIndexes = false;
                }
            }

            $checkedIndexes = [];
            foreach ($this->getOptions() as $index => $option) {
                if ($areIndexes && \in_array($index, $values, false)) {
                    $checkedIndexes[] = $index;
                } elseif (\in_array($option->getValue(), $values, true)) {
                    $checkedIndexes[] = $index;
                }
            }

            $values = $checkedIndexes;
        }

        return $values;
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function setValue($value)
    {
        if ($this instanceof MultipleValueInterface && !\is_array($value)) {
            if (null === $value) {
                $value = [];
            } else {
                $value = [$value];
            }
        }

        $this->values = $value;

        if ($this instanceof OptionsInterface) {
            $updatedOptions = [];
            foreach ($this->getOptions() as $index => $option) {
                if ($this instanceof ObscureValueInterface) {
                    $checked = \in_array($index, $value, false);
                } else {
                    $checked = \in_array($option->getValue(), $value, false);
                }

                $updatedOptions[] = new Option(
                    $option->getLabel(),
                    $option->getValue(),
                    $checked
                );
            }

            $this->options = $updatedOptions;
        }

        return $this;
    }
}
