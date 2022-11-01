<?php

namespace Solspace\Freeform\Attributes\Field;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public function __construct(
        public string $name,
        public string $typeShorthand,
        public string $iconPath,
    ) {
    }
}
