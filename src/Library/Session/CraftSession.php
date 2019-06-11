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

namespace Solspace\Freeform\Library\Session;

use Solspace\Freeform\Library\Logging\FreeformLogger;

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
            FreeformLogger::getInstance(FreeformLogger::FREEFORM)->error($e->getMessage(), ['Craft Session']);
        }
    }

    /**
     * @param string $key
     *
     * @return bool
     */
    public function remove($key): bool
    {
        if (!\Craft::$app->request->isConsoleRequest) {
            return (bool) \Craft::$app->session->remove($key);
        }

        return true;
    }
}
