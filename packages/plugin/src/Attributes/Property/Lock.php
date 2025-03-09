<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Lock
{
    public function __construct(
        public string $path,
    ) {}
}
