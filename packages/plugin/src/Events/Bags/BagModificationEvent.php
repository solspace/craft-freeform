<?php

namespace Solspace\Freeform\Events\Bags;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Bags\BagInterface;

class BagModificationEvent extends ArrayableEvent
{
    /** @var BagInterface */
    private $bag;

    /** @var string */
    private $key;

    /** @var mixed */
    private $value;

    public function __construct(BagInterface $bag, string $key, $value = null)
    {
        $this->bag = $bag;
        $this->key = $key;
        $this->value = $value;

        parent::__construct([]);
    }

    public function getBag(): BagInterface
    {
        return $this->bag;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function setKey(string $key): self
    {
        $this->key = $key;

        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value): self
    {
        $this->value = $value;

        return $this;
    }
}
