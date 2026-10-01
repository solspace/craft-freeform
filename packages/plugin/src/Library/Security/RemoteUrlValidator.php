<?php

namespace Solspace\Freeform\Library\Security;

use GuzzleHttp\Psr7\Uri;
use Solspace\Freeform\Library\Helpers\IpUtils;

final class RemoteUrlValidator
{
    private const BLOCKED_HOSTNAMES = [
        'kubernetes.default',
        'kubernetes.default.svc',
        'kubernetes.default.svc.cluster.local',
        'metadata',
        'metadata.google.internal',
        'metadata.packet.net',
    ];

    private const NON_PUBLIC_IP_RANGES = [
        '0.0.0.0/8',
        '10.0.0.0/8',
        '100.64.0.0/10',
        '127.0.0.0/8',
        '169.254.0.0/16',
        '172.16.0.0/12',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '192.31.196.0/24',
        '192.52.193.0/24',
        '192.88.99.0/24',
        '192.168.0.0/16',
        '192.175.48.0/24',
        '198.18.0.0/15',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '::/96',
        '::ffff:0:0/96',
        '64:ff9b::/96',
        '64:ff9b:1::/48',
        '100::/64',
        '2001::/23',
        '2001:db8::/32',
        '2002::/16',
        '3fff::/20',
        'fc00::/7',
        'fe80::/10',
        'ff00::/8',
    ];

    private \Closure $resolver;

    public function __construct(?callable $resolver = null)
    {
        $this->resolver = \Closure::fromCallable($resolver ?? [self::class, 'resolveHost']);
    }

    /**
     * @return array{host: string, port: int, addresses: string[], isIpAddress: bool}
     */
    public function validate(string $url): array
    {
        try {
            $uri = new Uri($url);
        } catch (\InvalidArgumentException) {
            throw new \InvalidArgumentException('The remote file URL is invalid.');
        }

        $scheme = strtolower($uri->getScheme());
        if (!\in_array($scheme, ['http', 'https'], true)) {
            throw new \InvalidArgumentException('Remote file URLs must use HTTP or HTTPS.');
        }

        if ('' !== $uri->getUserInfo()) {
            throw new \InvalidArgumentException('Remote file URLs must not contain credentials.');
        }

        $urlHost = $uri->getHost();
        $host = strtolower(trim($urlHost, '[]'));
        if ('' === $host || preg_match('/[\x00-\x20\x7f]/', $host)) {
            throw new \InvalidArgumentException('The remote file URL hostname is invalid.');
        }

        $isIpAddress = false !== filter_var($host, \FILTER_VALIDATE_IP);
        if ($isIpAddress) {
            $addresses = [$host];
        } else {
            $normalizedHost = rtrim($host, '.');
            if (
                false === filter_var($normalizedHost, \FILTER_VALIDATE_DOMAIN, \FILTER_FLAG_HOSTNAME)
                || \in_array($normalizedHost, self::BLOCKED_HOSTNAMES, true)
                || preg_match('/^(?:0x[0-9a-f]+|[0-9]+)(?:\.(?:0x[0-9a-f]+|[0-9]+))*$/i', $normalizedHost)
            ) {
                throw new \InvalidArgumentException('The remote file URL hostname is invalid.');
            }

            $addresses = ($this->resolver)($normalizedHost);
            if (!\is_array($addresses) || !$addresses) {
                throw new \InvalidArgumentException('The remote file URL hostname could not be resolved.');
            }
        }

        $addresses = array_values(array_unique(array_map('strtolower', $addresses)));
        foreach ($addresses as $address) {
            if (!$this->isPublicIpAddress($address)) {
                throw new \InvalidArgumentException('Remote file URLs must resolve only to public IP addresses.');
            }
        }

        return [
            'host' => $host,
            'port' => $uri->getPort() ?? ('https' === $scheme ? 443 : 80),
            'addresses' => $addresses,
            'isIpAddress' => $isIpAddress,
        ];
    }

    public function isPublicIpAddress(string $address): bool
    {
        if (false === filter_var(
            $address,
            \FILTER_VALIDATE_IP,
            \FILTER_FLAG_NO_PRIV_RANGE | \FILTER_FLAG_NO_RES_RANGE,
        ) || IpUtils::checkIp($address, self::NON_PUBLIC_IP_RANGES)) {
            return false;
        }

        return !str_contains($address, ':') || IpUtils::checkIp($address, '2000::/3');
    }

    private static function resolveHost(string $host): array
    {
        $addresses = [];
        $records = @dns_get_record($host, \DNS_A | \DNS_AAAA);

        if (\is_array($records)) {
            foreach ($records as $record) {
                if (!empty($record['ip'])) {
                    $addresses[] = $record['ip'];
                } elseif (!empty($record['ipv6'])) {
                    $addresses[] = $record['ipv6'];
                }
            }
        }

        $ipv4Addresses = @gethostbynamel($host);
        if (\is_array($ipv4Addresses)) {
            $addresses = array_merge($addresses, $ipv4Addresses);
        }

        return array_values(array_unique($addresses));
    }
}
