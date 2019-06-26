<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

trait OptionsTrait
{
    use OptionsKeyValuePairTrait;

    /** @var Option[] */
    protected $options;

    /**
     * @return Option[]
     */
    public function getOptions(): array
    {
        $value = $this->getValue();
        if (!is_array($value)) {
            $value = [$value];
        }

        $options = [];
        foreach ($this->options as $option) {
            $options[] = new Option(
                $option->getLabel(),
                $option->getValue(),
                \in_array($option->getValue(), $value, false)
            );
        }

        return $options;
    }
}
