<?php

namespace Solspace\Freeform\Library\Security;

use GuzzleHttp\Psr7\StreamDecoratorTrait;
use Psr\Http\Message\StreamInterface;

final class SizeLimitedStream implements StreamInterface
{
    use StreamDecoratorTrait;

    public function __construct(
        private StreamInterface $stream,
        private int $maxBytes,
    ) {
        if ($this->maxBytes < 1) {
            throw new \InvalidArgumentException('The maximum stream size must be greater than zero.');
        }
    }

    public function write($string): int
    {
        if ($this->stream->tell() + \strlen($string) > $this->maxBytes) {
            throw new \RuntimeException('The remote file exceeds the maximum allowed upload size.');
        }

        return $this->stream->write($string);
    }
}
