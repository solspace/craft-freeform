<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class Middleware implements CustomNormalizerInterface
{
    public function __construct(
        public string $name,
        public array $arguments = []
    ) {}

    public function normalize(): array
    {
        if (empty($this->arguments)) {
            return [$this->name];
        }

        return [$this->name, $this->arguments];
    }
}
