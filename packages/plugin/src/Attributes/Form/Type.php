<?php

namespace Solspace\Freeform\Attributes\Form;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public string $class;

    public function __construct(
        public ?string $name = null,
    ) {}
}
