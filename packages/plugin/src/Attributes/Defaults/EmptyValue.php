<?php

namespace Solspace\Freeform\Attributes\Defaults;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class EmptyValue
{
    public function __construct(public string $label) {}
}
