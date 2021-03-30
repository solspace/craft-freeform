<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\Bag;

use Carbon\Carbon;
use Solspace\Freeform\Library\Bags\AbstractBag;

class SessionBag extends AbstractBag
{
    /** @var Carbon */
    private $lastUpdate;

    public function __construct(array $properties = [], Carbon $lastUpdate = null)
    {
        $this->contents = $properties;
        $this->lastUpdate = $lastUpdate ?? new Carbon();
    }

    public function getLastUpdate(): Carbon
    {
        return $this->lastUpdate;
    }

    public function jsonSerialize(): array
    {
        return [
            'utime' => $this->getLastUpdate()->timestamp,
            'bag' => $this->contents,
        ];
    }
}
