<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Freeform;
use yii\base\Exception;
use yii\base\InvalidConfigException;

class EncryptionHelper
{
    public static function getKey(string $formUid): string
    {
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        $key = $secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $formUid;

        return $key;
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public static function encrypt(string $key, mixed $value): mixed
    {
        if (\is_array($value)) {
            foreach ($value as &$element) {
                $element = self::encrypt($key, $element);
            }
        } else {
            $encryptedValue = self::encryptByKey($key, $value);

            if ($encryptedValue) {
                $value = $encryptedValue;
            }
        }

        return $value;
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public static function decrypt(string $key, mixed $value): mixed
    {
        if (\is_array($value)) {
            foreach ($value as &$element) {
                $element = self::decrypt($key, $element);
            }
        } else {
            $decryptedValue = self::decryptByKey($key, $value);

            if ($decryptedValue) {
                $value = $decryptedValue;
            }
        }

        return $value;
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public static function decryptExportData(string $key, array $data): array
    {
        foreach ($data as &$values) {
            foreach ($values as &$value) {
                if ($value && (\is_string($value) || \is_array($value))) {
                    $decryptedValue = self::decrypt($key, $value);

                    $value = $decryptedValue;
                }
            }
        }

        return $data;
    }

    /**
     * @throws InvalidConfigException
     * @throws Exception
     */
    public static function encryptByKey(string $key, mixed $value): string
    {
        return base64_encode(\Craft::$app->getSecurity()->encryptByKey($value, $key));
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public static function decryptByKey(string $key, mixed $value): string
    {
        return \Craft::$app->getSecurity()->decryptByKey(base64_decode($value), $key);
    }
}
