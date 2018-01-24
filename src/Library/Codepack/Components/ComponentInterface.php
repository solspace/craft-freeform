<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Codepack\Components;

interface ComponentInterface
{
    /**
     * ComponentInterface constructor.
     *
     * @param string $location
     */
    public function __construct(string $location);

    /**
     * Calls the installation of this component
     *
     * @param string $prefix
     */
    public function install(string $prefix = null);
}
