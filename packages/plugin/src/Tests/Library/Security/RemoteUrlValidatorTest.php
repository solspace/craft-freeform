<?php

namespace Solspace\Freeform\Tests\Library\Security;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Security\RemoteUrlValidator;

#[CoversClass(RemoteUrlValidator::class)]
class RemoteUrlValidatorTest extends TestCase
{
    private const DNS = [
        'public.example' => ['93.184.216.34'],
        'mixed.example' => ['93.184.216.34', '127.0.0.1'],
        'private.example' => ['10.0.0.1'],
        'ipv6.example' => ['2606:4700:4700::1111'],
    ];

    private RemoteUrlValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new RemoteUrlValidator(
            static fn (string $host): array => self::DNS[$host] ?? [],
        );
    }

    #[DataProvider('unsafeUrlProvider')]
    public function testRejectsUnsafeUrls(string $url): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->validator->validate($url);
    }

    public static function unsafeUrlProvider(): iterable
    {
        yield 'protocol-relative URL' => ['//public.example/file.pdf'];

        yield 'file scheme' => ['file:///etc/passwd'];

        yield 'FTP scheme' => ['ftp://public.example/file.pdf'];

        yield 'credentials' => ['https://user:pass@public.example/file.pdf'];

        yield 'unresolved hostname' => ['https://unresolved.example/file.pdf'];

        yield 'localhost IPv4' => ['http://127.0.0.1/file.pdf'];

        yield 'private IPv4' => ['http://10.0.0.1/file.pdf'];

        yield 'link-local metadata IP' => ['http://169.254.169.254/latest/meta-data'];

        yield 'unspecified IPv4' => ['http://0.0.0.0/file.pdf'];

        yield 'IPv6 loopback' => ['http://[::1]/file.pdf'];

        yield 'IPv6 link-local' => ['http://[fe80::1]/file.pdf'];

        yield 'deprecated IPv6 site-local' => ['http://[fec0::1]/file.pdf'];

        yield 'CGNAT range' => ['http://100.64.0.1/file.pdf'];

        yield 'multicast range' => ['http://224.0.0.1/file.pdf'];

        yield 'documentation range' => ['http://192.0.2.1/file.pdf'];

        yield 'encoded IPv4 hostname' => ['http://2130706433/file.pdf'];

        yield 'hexadecimal IPv4 hostname' => ['http://0x7f000001/file.pdf'];

        yield 'known metadata hostname' => ['http://metadata.google.internal/file.pdf'];

        yield 'hostname with a private answer' => ['https://private.example/file.pdf'];

        yield 'hostname with mixed answers' => ['https://mixed.example/file.pdf'];
    }

    public function testAcceptsPublicHostnameAndReturnsConnectionTarget(): void
    {
        self::assertSame([
            'host' => 'public.example',
            'port' => 8443,
            'addresses' => ['93.184.216.34'],
            'isIpAddress' => false,
        ], $this->validator->validate('https://public.example:8443/file.pdf'));
    }

    public function testAcceptsPublicIpLiterals(): void
    {
        self::assertTrue($this->validator->validate('http://8.8.8.8/file.pdf')['isIpAddress']);
        self::assertTrue($this->validator->validate('https://[2606:4700:4700::1111]/file.pdf')['isIpAddress']);
    }

    public function testAcceptsPublicIpv6DnsAnswer(): void
    {
        self::assertSame(
            ['2606:4700:4700::1111'],
            $this->validator->validate('https://ipv6.example/file.pdf')['addresses'],
        );
    }
}
