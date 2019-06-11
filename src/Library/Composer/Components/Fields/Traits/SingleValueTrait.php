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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use LitEmoji\LitEmoji;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\OptionsInterface;

trait SingleValueTrait
{
    /** @var string */
    protected $value;

    /**
     * @return string|null
     */
    public function getValue()
    {
        if ($this->getValueOverride()) {
            return $this->getValueOverride();
        }

        return (string) $this->value;
        // return (string) LitEmoji::shortcodeToUnicode($this->value);
    }

    /**
     * @param string $value
     *
     * @return $this
     */
    public function setValue($value)
    {
        $this->value = $value;

        if ($this instanceof OptionsInterface) {
            $updatedOptions = [];

            if ($this instanceof ObscureValueInterface) {
                $objectValue = $this->getValue();
                if (is_numeric($value)) {
                    $objectValue = $this->getActualValue($this->getValue());
                }
            } else {
                $objectValue = $this->getValue();
            }

            foreach ($this->getOptions() as $option) {
                $updatedOptions[] = new Option(
                    $option->getLabel(),
                    $option->getValue(),
                    $option->getValue() === (string) $objectValue
                );
            }

            $this->options = $updatedOptions;
        }

        return $this;
    }
}
