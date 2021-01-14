<?php

namespace Solspace\Freeform\Events\Honeypot;

use yii\base\Event;

class RenderHoneypotEvent extends Event
{
    /** @var string */
    private $output;

    public function __construct(string $honeypot)
    {
        $this->output = $honeypot;

        parent::__construct([]);
    }

    public function getOutput(): string
    {
        return $this->output;
    }

    public function setOutput(string $output)
    {
        $this->output = $output;
    }
}
