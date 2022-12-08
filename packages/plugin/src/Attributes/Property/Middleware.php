<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Middleware
{
    public function __construct(public string $name, public array $arguments = [])
    {
    }
}
