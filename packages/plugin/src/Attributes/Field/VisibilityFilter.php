<?php

namespace Solspace\Freeform\Attributes\Field;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class VisibilityFilter
{
    public function __construct(public string $name)
    {
    }
}
