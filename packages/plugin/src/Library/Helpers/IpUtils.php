<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Solspace\Freeform\Library\Helpers;

/**
 * Http utility functions.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 */
class IpUtils
{
    private static array $checkedIps = [];

    /**
     * Checks if an IPv4 or IPv6 address is contained in the list of given IPs or subnets.
     */
    public static function checkIp(string $requestIp, array|string $ips): bool
    {
        if (!\is_array($ips)) {
            $ips = [$ips];
        }

        $method = str_contains($requestIp, ':') ? 'checkIp6' : 'checkIp4';

        foreach ($ips as $ip) {
            if (self::$method($requestIp, $ip)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Compares two IPv4 addresses.
     * In case a subnet is given, it checks if it contains the request IP.
     */
    public static function checkIp4(string $requestIp, string $ip): bool
    {
        $cacheKey = $requestIp.'-'.$ip;
        if (isset(self::$checkedIps[$cacheKey])) {
            return self::$checkedIps[$cacheKey];
        }

        if (!filter_var($requestIp, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV4)) {
            return self::$checkedIps[$cacheKey] = false;
        }

        if (str_contains($ip, '/')) {
            [$address, $netmask] = explode('/', $ip, 2);

            if ('0' === $netmask) {
                return self::$checkedIps[$cacheKey] = filter_var($address, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV4);
            }

            if ($netmask < 0 || $netmask > 32) {
                return self::$checkedIps[$cacheKey] = false;
            }
        } else {
            $address = $ip;
            $netmask = 32;
        }

        if (false === ip2long($address)) {
            return self::$checkedIps[$cacheKey] = false;
        }

        return self::$checkedIps[$cacheKey] = 0 === substr_compare(\sprintf('%032b', ip2long($requestIp)), \sprintf('%032b', ip2long($address)), 0, $netmask);
    }

    /**
     * Compares two IPv6 addresses.
     * In case a subnet is given, it checks if it contains the request IP.
     *
     * @author David Soria Parra <dsp at php dot net>
     *
     * @see https://github.com/dsp/v6tools
     *
     * @throws \RuntimeException When IPV6 support is not enabled
     */
    public static function checkIp6(string $requestIp, string $ip): bool
    {
        $cacheKey = $requestIp.'-'.$ip;
        if (isset(self::$checkedIps[$cacheKey])) {
            return self::$checkedIps[$cacheKey];
        }

        if (!((\extension_loaded('sockets') && \defined('AF_INET6')) || @inet_pton('::1'))) {
            throw new \RuntimeException('Unable to check Ipv6. Check that PHP was not compiled with option "disable-ipv6".');
        }

        if (str_contains($ip, '/')) {
            [$address, $netmask] = explode('/', $ip, 2);

            if ('0' === $netmask) {
                return (bool) unpack('n*', @inet_pton($address));
            }

            if ($netmask < 1 || $netmask > 128) {
                return self::$checkedIps[$cacheKey] = false;
            }
        } else {
            $address = $ip;
            $netmask = 128;
        }

        $bytesAddr = unpack('n*', @inet_pton($address));
        $bytesTest = unpack('n*', @inet_pton($requestIp));

        if (!$bytesAddr || !$bytesTest) {
            return self::$checkedIps[$cacheKey] = false;
        }

        for ($i = 1, $ceil = ceil($netmask / 16); $i <= $ceil; ++$i) {
            $left = $netmask - 16 * ($i - 1);
            $left = ($left <= 16) ? $left : 16;
            $mask = ~(0xFFFF >> $left) & 0xFFFF;
            if (($bytesAddr[$i] & $mask) != ($bytesTest[$i] & $mask)) {
                return self::$checkedIps[$cacheKey] = false;
            }
        }

        return self::$checkedIps[$cacheKey] = true;
    }

    public static function checkDnsBlockLists(string $requestIp, array $dnsBlockLists): bool
    {
        // Skip IPv6 entirely (or implement a v6 DNS BL)
        if (filter_var($requestIp, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV6)) {
            return false;
        }

        // Explicitly skip well-known non-routable/documentation ranges
        // RFC 5737 (TEST-NET): 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
        // Benchmarking: 198.18.0.0/15, Carrier-Grade NAT: 100.64.0.0/10, Loopback/Private/Link-local: handled below too
        $nonRoutablePatterns = [
            '/^192\.0\.2\./', // TEST-NET-1
            '/^198\.51\.100\./', // TEST-NET-2
            '/^203\.0\.113\./', // TEST-NET-3
            '/^198\.(18|19)\./', // 198.18.0.0/15 benchmarking
            '/^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./', // 100.64.0.0/10 CGNAT
        ];

        foreach ($nonRoutablePatterns as $nonRoutablePattern) {
            if (preg_match($nonRoutablePattern, $requestIp)) {
                return false;
            }
        }

        // Only public IPv4: skip loopback/private/link-local/**reserved** per PHP's flags
        if (false === filter_var($requestIp, \FILTER_VALIDATE_IP, \FILTER_FLAG_NO_PRIV_RANGE | \FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }

        // At this point we have a public IPv4; do the lookup
        $reverse = implode('.', array_reverse(explode('.', $requestIp)));

        foreach ($dnsBlockLists as $dnsBlockList) {
            if (@checkdnsrr("{$reverse}.{$dnsBlockList}", 'A')) {
                return true;
            }
        }

        return false;
    }
}
