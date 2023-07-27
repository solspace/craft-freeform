<?php

namespace Solspace\Freeform\Attributes;

#[\Attribute(\Attribute::TARGET_CLASS)]
class EventListener
{
    public function __construct(
        public string $class
    ) {
    }
}
