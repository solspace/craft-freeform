<?php

namespace Solspace\Freeform\Attributes;

#[\Attribute(\Attribute::TARGET_CLASS | \Attribute::IS_REPEATABLE)]
class EventListener
{
    public function __construct(
        public string $class
    ) {
    }
}
