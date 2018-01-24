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

namespace Solspace\Freeform\Library\Session;

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
        return \Craft::$app->session->get($key, $defaultValue);
    }

    /**
     * @param string $key
     * @param mixed  $value
     */
    public function set($key, $value)
    {
        \Craft::$app->session->set($key, $value);
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
