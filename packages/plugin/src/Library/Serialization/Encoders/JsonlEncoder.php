<?php

namespace Solspace\Freeform\Library\Serialization\Encoders;

use Symfony\Component\Serializer\Encoder\EncoderInterface;
use Symfony\Component\Serializer\Exception\UnexpectedValueException;

class JsonlEncoder implements EncoderInterface
{
    public function encode(mixed $data, string $format, array $context = []): string
    {
        if (!is_iterable($data)) {
            throw new UnexpectedValueException('Data must be an array');
        }

        if ($data instanceof \IteratorAggregate) {
            $data = iterator_to_array($data);
        }

        $data = array_map(
            fn ($item) => json_encode($item, \JSON_THROW_ON_ERROR),
            $data
        );

        return implode(\PHP_EOL, $data);
    }

    public function supportsEncoding(string $format): bool
    {
        return 'jsonl' === $format;
    }
}
