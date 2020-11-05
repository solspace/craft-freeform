<?php

namespace Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats;

use Carbon\Carbon;

class PluginInfo implements \JsonSerializable
{
    /** @var string */
    public $version = '';

    /** @var Carbon */
    public $installDate;

    /** @var string */
    public $edition = '';

    /** @var bool */
    public $license = false;

    public function jsonSerialize()
    {
        return [
            'version' => $this->version,
            'installDate' => $this->installDate ? $this->installDate->toAtomString() : null,
            'edition' => $this->edition,
            'license' => $this->license,
        ];
    }
}
