<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes;

abstract class BaseItemType
{
    public string $id;
    public string $name;
    public string $type;
    public ?array $children = null;

    public function __construct(?string $id = null, ?string $name = null)
    {
        if ($id) {
            $this->id = $id;
        }

        if ($name) {
            $this->name = $name;
        }
    }

    public function setId(string $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function setChildren(?array $children): self
    {
        $this->children = $children;

        return $this;
    }
}
