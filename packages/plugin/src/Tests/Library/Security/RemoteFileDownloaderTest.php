<?php

namespace Solspace\Freeform\Tests\Library\Security;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Promise\FulfilledPromise;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\RequestOptions;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Security\RemoteFileDownloader;
use Solspace\Freeform\Library\Security\RemoteUrlValidator;

#[CoversClass(RemoteFileDownloader::class)]
class RemoteFileDownloaderTest extends TestCase
{
    private array $history;
    private string $tempPath;

    protected function setUp(): void
    {
        $this->history = [];
        $this->tempPath = tempnam(sys_get_temp_dir(), 'freeform-remote-file-');
    }

    protected function tearDown(): void
    {
        if (is_file($this->tempPath)) {
            unlink($this->tempPath);
        }
    }

    public function testPinsValidatedAddressAndDisablesRedirects(): void
    {
        $downloader = $this->createDownloader(new Response(200));

        $downloader->download('https://public.example/file.pdf', $this->tempPath, 1024);

        self::assertCount(1, $this->history);
        $options = $this->history[0]['options'];
        self::assertFalse($options[RequestOptions::ALLOW_REDIRECTS]);
        self::assertSame('1.1', $this->history[0]['request']->getProtocolVersion());
        self::assertSame(
            ['public.example:443:93.184.216.34'],
            $options['curl'][\CURLOPT_RESOLVE],
        );
        self::assertSame(
            \CURLPROTO_HTTP | \CURLPROTO_HTTPS,
            $options['curl'][\CURLOPT_PROTOCOLS],
        );
        self::assertSame('', $options['curl'][\CURLOPT_PROXY]);
    }

    public function testRejectsUnsafeUrlBeforeIssuingRequest(): void
    {
        $downloader = $this->createDownloader(new Response(200));

        try {
            $downloader->download('http://127.0.0.1/internal', $this->tempPath, 1024);
            self::fail('Expected the unsafe URL to be rejected.');
        } catch (\InvalidArgumentException) {
            self::assertSame([], $this->history);
        }
    }

    public function testRejectsRedirectResponseWithoutFollowingIt(): void
    {
        $downloader = $this->createDownloader(new Response(302, ['Location' => 'http://127.0.0.1/internal']));

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('did not return a successful response');

        try {
            $downloader->download('https://public.example/file.pdf', $this->tempPath, 1024);
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public function testStopsWritingWhenResponseExceedsMaximumSize(): void
    {
        $downloader = $this->createDownloader(new Response(200, [], str_repeat('a', 11)), true);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('exceeds the maximum allowed upload size');

        $downloader->download('https://public.example/file.pdf', $this->tempPath, 10);
    }

    private function createDownloader(Response $response, bool $writeResponse = false): RemoteFileDownloader
    {
        $validator = new RemoteUrlValidator(
            static fn (string $host): array => 'public.example' === $host ? ['93.184.216.34'] : [],
        );

        $stack = HandlerStack::create(
            static function ($request, array $options) use ($response, $writeResponse): FulfilledPromise {
                if ($writeResponse) {
                    $options[RequestOptions::SINK]->write((string) $response->getBody());
                }

                return new FulfilledPromise($response);
            },
        );
        $stack->push(Middleware::history($this->history));

        return new RemoteFileDownloader($validator, new Client(['handler' => $stack]));
    }
}
