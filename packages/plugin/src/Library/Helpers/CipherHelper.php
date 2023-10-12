<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class CipherHelper
{
    public static function getKey(Form $form): string
    {
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        $key = $secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $form->getUid();

        return $key;
    }
}
