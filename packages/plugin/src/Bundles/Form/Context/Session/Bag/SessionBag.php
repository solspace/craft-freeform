<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\Bag;

use Carbon\Carbon;
use Solspace\Freeform\Library\Bags\BagInterface;

class SessionBag implements BagInterface
{
    /** @var array */
    private $bag;

    /** @var Carbon */
    private $lastUpdate;

    public function __construct(array $properties, Carbon $lastUpdate)
    {
        $this->bag = $properties;
        $this->lastUpdate = $lastUpdate;
    }

    public function getLastUpdate(): Carbon
    {
        return $this->lastUpdate;
    }

    public function isset(string $key): bool
    {
        return isset($this->bag[$key]);
    }

    public function get(string $key, $defaultValue = null)
    {
        if (!$this->isset($key)) {
            return $defaultValue;
        }

        return $this->bag[$key];
    }

    public function add(string $key, $value): self
    {
        $this->bag[$key] = $value;

        return $this;
    }

    public function remove(string $key): self
    {
        unset($this->bag[$key]);

        return $this;
    }

    public function jsonSerialize()
    {
        return [
            'utime' => $this->getLastUpdate()->timestamp,
            'bag' => $this->bag,
        ];
    }
}
