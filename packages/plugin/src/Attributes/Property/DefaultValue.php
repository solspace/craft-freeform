<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class DefaultValue
{
    public function __construct(
        public string $path,
    ) {}
}
