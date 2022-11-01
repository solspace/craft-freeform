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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\FieldInterface;
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
    public function getValue(): mixed
    {
        $values = $this->values;

        if (!\is_array($values) && !empty($values)) {
            $values = [$values];
        }

        if (empty($values)) {
            $values = [];
        } elseif (!$this instanceof MultiDimensionalValueInterface) {
            $values = array_map('strval', $values);
        }

        return $values;
    }

    public function setValue(mixed $value): FieldInterface
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
