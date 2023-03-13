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

namespace Solspace\Freeform\Fields\Interfaces;

interface ObscureValueInterface
{
    /**
     * Return the real value of this field
     * Instead of the obscured one.
     *
     * @param mixed $obscuredValue
     *
     * @return mixed
     */
    public function getActualValue($obscuredValue);
}
