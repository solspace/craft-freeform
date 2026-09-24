<?php

namespace Solspace\Freeform\Tests\Library\Security;

use GuzzleHttp\Psr7\Utils;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Security\SizeLimitedStream;

#[CoversClass(SizeLimitedStream::class)]
class SizeLimitedStreamTest extends TestCase
{
    public function testAcceptsExactMaximumSize(): void
    {
        $stream = new SizeLimitedStream(Utils::streamFor(fopen('php://temp', 'w+')), 5);

        self::assertSame(5, $stream->write('12345'));
        self::assertSame(5, $stream->getSize());
    }

    public function testRejectsWriteThatWouldExceedMaximumSize(): void
    {
        $stream = new SizeLimitedStream(Utils::streamFor(fopen('php://temp', 'w+')), 5);
        $stream->write('1234');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('exceeds the maximum allowed upload size');

        $stream->write('56');
    }
}
