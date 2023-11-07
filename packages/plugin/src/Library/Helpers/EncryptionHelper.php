<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Freeform;

class EncryptionHelper
{
    public const ENCRYPTED = 'encrypted';

    public static function getKey(string $formUid): string
    {
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        $key = $secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $formUid;

        return $key;
    }

    public static function encrypt(string $key, mixed $value): string
    {
        $prefix = self::ENCRYPTED;

        $value = self::encryptByKey($key, $value);

        return $prefix.':'.$value;
    }

    public static function decrypt(string $key, mixed $value): mixed
    {
        $prefix = self::ENCRYPTED;

        if (\is_string($value) && str_starts_with($value, $prefix)) {
            $value = str_replace([$prefix, ':'], '', $value);

            return self::decryptByKey($key, $value);
        }

        return $value;
    }

    public static function decryptExportData(string $key, array $encryptedData): array
    {
        $decryptedData = [];

        foreach ($encryptedData as $row) {
            $decryptedRow = [];

            foreach ($row as $handle => $value) {
                $decryptedRow[$handle] = self::decrypt($key, $value);
            }

            $decryptedData[] = $decryptedRow;
        }

        return $decryptedData;
    }

    public static function encryptByKey(string $key, string $value): string
    {
        return base64_encode(\Craft::$app->getSecurity()->encryptByKey($value, $key));
    }

    public static function decryptByKey(string $key, string $value): string
    {
        return \Craft::$app->getSecurity()->decryptByKey(base64_decode($value), $key);
    }
}
