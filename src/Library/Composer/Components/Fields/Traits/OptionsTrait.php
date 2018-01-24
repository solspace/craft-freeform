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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

trait OptionsTrait
{
    /** @var Option[] */
    protected $options;

    /**
     * @return Option[]
     */
    public function getOptions(): array
    {
        return $this->options;
    }

    /**
     * @return array
     */
    public function getOptionsAsKeyValuePairs(): array
    {
        $pairs = [];

        foreach ($this->getOptions() as $option) {
            $pairs[$option->getValue()] = $option->getLabel();
        }

        return $pairs;
    }
}
