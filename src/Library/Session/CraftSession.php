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

namespace Solspace\Freeform\Library\Session;

use Solspace\Freeform\Library\Logging\CraftLogger;

class CraftSession implements SessionInterface
{
    /**
     * @param string     $key
     * @param mixed|null $defaultValue
     *
     * @return mixed
     */
    public function get($key, $defaultValue = null)
    {
        try {
            return \Craft::$app->session->get($key, $defaultValue);
        } catch (\Exception $e) {
            return $defaultValue;
        }
    }

    /**
     * @param string $key
     * @param mixed  $value
     */
    public function set($key, $value)
    {
        try {
            \Craft::$app->session->set($key, $value);
        } catch (\Exception $e) {
            (new CraftLogger())->log(CraftLogger::LEVEL_ERROR, $e->getMessage(), 'freeform_craft_session');
        }
    }

    /**
     * @param string $key
     *
     * @return bool
     */
    public function remove($key): bool
    {
        return (bool) \Craft::$app->session->remove($key);
    }
}
