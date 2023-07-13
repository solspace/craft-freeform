<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\FieldMapping;

use Symfony\Component\Serializer\Annotation\Ignore;

class FieldMapItem
{
    public function __construct(
        private string $type,
        private string $source,
        private string $value,
    ) {
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    #[Ignore]
    public function getSource(): string
    {
        return $this->source;
    }
}
