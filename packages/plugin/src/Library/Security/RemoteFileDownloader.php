<?php

namespace Solspace\Freeform\Library\Security;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Handler\CurlHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Utils;
use GuzzleHttp\RequestOptions;
use GuzzleHttp\TransferStats;

final class RemoteFileDownloader
{
    public function __construct(
        private ?RemoteUrlValidator $urlValidator = null,
        private ?ClientInterface $client = null,
    ) {
        $this->urlValidator ??= new RemoteUrlValidator();
    }

    public function download(string $url, string $destination, int $maxBytes): void
    {
        $target = $this->urlValidator->validate($url);

        if (!\defined('CURLOPT_RESOLVE') || !\extension_loaded('curl')) {
            throw new \RuntimeException('Remote file uploads require the cURL PHP extension.');
        }

        $address = $target['addresses'][0];
        $curlOptions = [
            \CURLOPT_PROTOCOLS => \CURLPROTO_HTTP | \CURLPROTO_HTTPS,
            \CURLOPT_PROXY => '',
        ];

        if (!$target['isIpAddress']) {
            $resolveAddress = str_contains($address, ':') ? "[{$address}]" : $address;
            $curlOptions[\CURLOPT_RESOLVE] = [
                "{$target['host']}:{$target['port']}:{$resolveAddress}",
            ];
        }

        $expectedAddress = inet_pton($address);
        $destinationStream = new SizeLimitedStream(
            Utils::streamFor(Utils::tryFopen($destination, 'w+b')),
            $maxBytes,
        );

        try {
            $response = $this->getClient()->request('GET', $url, [
                RequestOptions::ALLOW_REDIRECTS => false,
                RequestOptions::CONNECT_TIMEOUT => 10,
                RequestOptions::SINK => $destinationStream,
                RequestOptions::TIMEOUT => 30,
                RequestOptions::VERSION => 1.1,
                'curl' => $curlOptions,
                RequestOptions::ON_STATS => static function (TransferStats $stats) use ($expectedAddress): void {
                    $connectedAddress = $stats->getHandlerStat('primary_ip');
                    if (!$connectedAddress || inet_pton($connectedAddress) !== $expectedAddress) {
                        throw new \RuntimeException('The remote file connection used an unexpected IP address.');
                    }
                },
            ]);
        } finally {
            $destinationStream->close();
        }

        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            throw new \RuntimeException('The remote file URL did not return a successful response.');
        }
    }

    private function getClient(): ClientInterface
    {
        if ($this->client) {
            return $this->client;
        }

        $handler = HandlerStack::create(new CurlHandler());

        return $this->client = new Client(['handler' => $handler]);
    }
}
