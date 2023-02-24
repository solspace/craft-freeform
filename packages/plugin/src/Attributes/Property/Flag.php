<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Flag
{
    public const ENCRYPTED = 'encrypted';
    public const READONLY = 'readonly';

    public function __construct(public string $name)
    {
    }
}
