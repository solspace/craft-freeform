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

class CraftRequest implements RequestInterface
{
    /**
     * @param string     $key
     * @param null|mixed $defaultValue
     *
     * @return mixed
     */
    public function getPost($key, $defaultValue = null)
    {
        if (!\Craft::$app->request->isConsoleRequest) {
            return \Craft::$app->request->post($key, $defaultValue);
        }

        return $defaultValue;
    }

    /**
     * @param string $key
     * @param null   $defaultValue
     *
     * @return null|array|mixed
     */
    public function getGet($key, $defaultValue = null)
    {
        if (!\Craft::$app->request->isConsoleRequest) {
            return \Craft::$app->request->get($key, $defaultValue);
        }

        return $defaultValue;
    }
}
