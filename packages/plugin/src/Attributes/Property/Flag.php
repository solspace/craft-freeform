<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Flag implements CustomNormalizerInterface
{
    public function __construct(public string $name)
    {
    }

    public function normalize(): string
    {
        return $this->name;
    }
}
