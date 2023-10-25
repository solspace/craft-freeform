<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class EncryptionHelper
{
    public static function getKey(Form $form): string
    {
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        $key = $secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $form->getUid();

        return $key;
    }

    public static function decrypt(Form $form, array $data): array
    {
        $key = self::getKey($form);

        foreach ($data as &$submission) {
            foreach ($submission as &$field) {
                if ($field && \is_string($field)) {
                    $decryptedValue = \Craft::$app->getSecurity()->decryptByKey(base64_decode($field), $key);

                    if ($decryptedValue) {
                        $field = $decryptedValue;
                    }
                }
            }
        }

        return $data;
    }
}
