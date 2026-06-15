<?php

namespace Solspace\Freeform\Library\Helpers;

use CraftCms\Cms\Cms;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * Encrypts and decrypts sensitive values using Craft's platform keys.
 *
 * - Craft 4/5: uses CRAFT_SECURITY_KEY (general.securityKey)
 * - Craft 6: uses APP_KEY via Laravel Crypt when securityKey is not set
 *
 * Site owners do not need any Freeform-specific security configuration.
 */
class SecurityHelper
{
    /**
     * Returns Craft's legacy security key when one is configured.
     */
    public static function getSecurityKey(): ?string
    {
        $key = Cms::config()->securityKey;
        if ('' !== $key) {
            return $key;
        }

        $legacyKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        return '' !== $legacyKey ? $legacyKey : null;
    }

    public static function encrypt(string $value, ?string $key = null): string
    {
        if (null !== $key && '' !== $key) {
            return base64_encode(\Craft::$app->getSecurity()->encryptByKey($value, $key));
        }

        $securityKey = self::getSecurityKey();
        if (null !== $securityKey) {
            return base64_encode(\Craft::$app->getSecurity()->encryptByKey($value, $securityKey));
        }

        return base64_encode(Crypt::encryptString($value));
    }

    public static function decrypt(string $value, ?string $key = null): false|string
    {
        $decoded = base64_decode($value, true);
        if (false === $decoded) {
            return false;
        }

        if (null !== $key && '' !== $key) {
            $decrypted = \Craft::$app->getSecurity()->decryptByKey($decoded, $key);
            if (false !== $decrypted) {
                return $decrypted;
            }
        }

        $securityKey = self::getSecurityKey();
        if (null !== $securityKey) {
            $decrypted = \Craft::$app->getSecurity()->decryptByKey($decoded, $securityKey);
            if (false !== $decrypted) {
                return $decrypted;
            }
        }

        try {
            return Crypt::decryptString($decoded);
        } catch (DecryptException) {
            return \Craft::$app->getSecurity()->decryptByKey($decoded);
        }
    }
}
