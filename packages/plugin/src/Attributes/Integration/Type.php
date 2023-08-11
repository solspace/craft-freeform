<?php

namespace Solspace\Freeform\Attributes\Integration;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public string $class;
    public string $shortName;

    public function __construct(
        public string $name,
        public ?string $readme = null,
        public ?string $iconPath = null,
    ) {
    }

    public function __toString(): string
    {
        return $this->name;
    }

    public function getReadmeContent(): ?string
    {
        if ($this->readme && file_exists($this->readme)) {
            return file_get_contents($this->readme);
        }

        return null;
    }
}
