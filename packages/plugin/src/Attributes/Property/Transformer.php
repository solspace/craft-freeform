<?php

namespace Solspace\Freeform\Attributes\Property;

abstract class Transformer implements TransformerInterface, \JsonSerializable
{
    public function jsonSerialize(): string
    {
        return static::class;
    }
}
