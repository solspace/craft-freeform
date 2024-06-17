<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes;

class Boolean extends BaseItemType
{
    public string $type = 'boolean';
    public bool $enabled = true;

    public function __construct(?string $id = null, ?string $name = null, ?bool $enabled = null)
    {
        parent::__construct($id, $name);

        if (null !== $enabled) {
            $this->enabled = $enabled;
        }
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }
}
