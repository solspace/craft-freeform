<?php

namespace Solspace\Freeform\Attributes\Defaults;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class SetPlaceholder
{
    public function __construct(public mixed $value) {}
}
