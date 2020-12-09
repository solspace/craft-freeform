<?php

namespace Solspace\Freeform\Library\DataObjects\Summary;

class InstallSummary
{
    /** @var string */
    public $version = '1.0.0';

    /** @var Statistics */
    public $statistics;

    public function __construct()
    {
        $this->statistics = new Statistics();
    }
}
