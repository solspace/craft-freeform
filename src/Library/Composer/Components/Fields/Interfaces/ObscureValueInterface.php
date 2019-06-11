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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface ObscureValueInterface
{
    /**
     * Return the real value of this field
     * Instead of the obscured one
     *
     * @param mixed $obscuredValue
     *
     * @return mixed
     */
    public function getActualValue($obscuredValue);
}
