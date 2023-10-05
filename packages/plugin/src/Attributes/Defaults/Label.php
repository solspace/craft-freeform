<?php

namespace Solspace\Freeform\Attributes\Defaults;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Label
{
    public function __construct(public string $label)
    {
    }
}
