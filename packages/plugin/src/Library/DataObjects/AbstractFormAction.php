<?php

namespace Solspace\Freeform\Library\DataObjects;

abstract class AbstractFormAction implements FormActionInterface
{
    public function __construct(private array $metadata = []) {}

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function jsonSerialize(): array
    {
        return [
            'name' => $this->getName(),
            'metadata' => $this->getMetadata(),
        ];
    }
}
