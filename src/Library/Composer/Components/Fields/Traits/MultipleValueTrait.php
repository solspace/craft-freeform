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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
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
            if (!is_array($valueOverride)) {
                return [$valueOverride];
            }

            return $valueOverride;
        }

        $values = $this->values;

        if (empty($values)) {
            $values = [];
        }

        if (!is_array($values)) {
            $values = [$values];
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
        $this->values = $value;

        if ($this instanceof OptionsInterface) {
            $updatedOptions = [];
            foreach ($this->getOptions() as $option) {
                if (is_numeric($option->getValue())) {
                    $checked = \in_array((int) $option->getValue(), $this->getValue(), false);
                } else {
                    $checked = \in_array($option->getValue(), $this->getValue(), true);
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
