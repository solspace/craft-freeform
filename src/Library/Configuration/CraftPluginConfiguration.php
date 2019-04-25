<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Freeform;

class CraftPluginConfiguration implements ConfigurationInterface
{
    const CONTEXT = 'freeform';

    /**
     * @param string $key
     *
     * @return mixed|null
     */
    public function get($key)
    {
        $settings = Freeform::getInstance()->getSettings();

        return $settings->$key ?? null;
    }
}
