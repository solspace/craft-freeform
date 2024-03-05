<?php

namespace Solspace\Freeform\Library\Helpers;

class CryptoHelper
{
    /**
     * Generate a unique token.
     */
    public static function getUniqueToken(int $length = 40): string
    {
        $token = '';
        $codeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $codeAlphabet .= 'abcdefghijklmnopqrstuvwxyz';
        $codeAlphabet .= '0123456789';
        $max = \strlen($codeAlphabet); // edited

        for ($i = 0; $i < $length; ++$i) {
            $token .= $codeAlphabet[self::getSecureRandomInt(0, $max - 1)];
        }

        return $token;
    }

    /**
     * Generate a secure random int.
     */
    public static function getSecureRandomInt(int $min, int $max): int
    {
        if (\function_exists('random_int')) {
            return random_int($min, $max);
        }

        $range = $max - $min;

        if ($range < 1) {
            return $min; // not so random...
        }

        $log = ceil(log($range, 2));
        $bytes = (int) ($log / 8) + 1; // length in bytes
        $bits = (int) $log + 1; // length in bits
        $filter = (int) (1 << $bits) - 1; // set all lower bits to 1
        do {
            $rnd = hexdec(bin2hex(openssl_random_pseudo_bytes($bytes)));
            $rnd &= $filter; // discard irrelevant bits
        } while ($rnd > $range);

        return $min + $rnd;
    }
}
