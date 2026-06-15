<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Freeform;

class EncryptionHelper
{
    private const ENCRYPTION_PREFIX = 'encrypted:';

    public static function getKey(string $suffix = ''): string
    {
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        $key = $secret ?: (SecurityHelper::getSecurityKey() ?? '');
        $key .= $suffix;

        return $key;
    }

    public static function encrypt(string $key, mixed $value): string
    {
        $prefix = self::ENCRYPTION_PREFIX;
        $value = self::encryptByKey($key, $value);

        return $prefix.$value;
    }

    public static function decrypt(string $key, mixed $value): mixed
    {
        $prefix = self::ENCRYPTION_PREFIX;

        if (\is_string($value) && str_starts_with($value, $prefix)) {
            $value = substr($value, \strlen($prefix));

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
        return SecurityHelper::encrypt($value, '' !== $key ? $key : null);
    }

    public static function decryptByKey(string $key, string $value): string
    {
        $decrypted = SecurityHelper::decrypt($value, '' !== $key ? $key : null);

        return false === $decrypted ? '' : $decrypted;
    }
}
