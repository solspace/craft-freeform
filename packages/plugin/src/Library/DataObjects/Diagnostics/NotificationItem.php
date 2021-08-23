<?php

namespace Solspace\Freeform\Library\DataObjects\Diagnostics;

use Twig\Markup;

class NotificationItem
{
    /** @var Markup */
    private $heading;

    /** @var Markup */
    private $message;

    /** @var string */
    private $type;

    public function __construct(Markup $heading, Markup $message, string $type)
    {
        $this->heading = $heading;
        $this->message = $message;
        $this->type = $type;
    }

    public function getHeading(): Markup
    {
        return $this->heading;
    }

    public function getMessage(): Markup
    {
        return $this->message;
    }

    public function getType(): string
    {
        return $this->type;
    }
}
