<?php

namespace Solspace\Freeform\Library\Helpers;

class RequestHelper
{
    public static function post(string $name, $defaultValue = null)
    {
        $request = \Craft::$app->request;
        if ($request->isConsoleRequest) {
            return $defaultValue;
        }

        return $request->post($name, $defaultValue);
    }
}
