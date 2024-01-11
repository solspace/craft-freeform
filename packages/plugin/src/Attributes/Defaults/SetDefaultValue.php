<?php

namespace Solspace\Freeform\Attributes\Defaults;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class SetDefaultValue
{
    public function __construct(public mixed $value) {}
}
