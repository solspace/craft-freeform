<?php

namespace Solspace\Freeform\Attributes\Defaults;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class OptionsGenerator
{
    public function __construct(public string $generator) {}
}
