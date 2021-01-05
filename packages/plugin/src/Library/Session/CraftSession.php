<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Session;

class CraftSession implements SessionInterface
{
    /**
     * @param string     $key
     * @param null|mixed $defaultValue
     *
     * @return mixed
     */
    public function get($key, $defaultValue = null)
    {
        try {
            if (!\Craft::$app->request->isConsoleRequest) {
                return \Craft::$app->session->get($key, $defaultValue);
            }
        } catch (\Exception $e) {
        }

        return $defaultValue;
    }

    /**
     * @param string $key
     * @param mixed  $value
     */
    public function set($key, $value)
    {
        try {
            if (!\Craft::$app->request->isConsoleRequest) {
                \Craft::$app->session->set($key, $value);
            }
        } catch (\Exception $e) {
        }
    }

    /**
     * @param string $key
     */
    public function remove($key): bool
    {
        if (!\Craft::$app->request->isConsoleRequest) {
            return (bool) \Craft::$app->session->remove($key);
        }

        return true;
    }
}
