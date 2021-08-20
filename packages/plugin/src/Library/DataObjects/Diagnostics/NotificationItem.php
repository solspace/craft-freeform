<?php

namespace Solspace\Freeform\Library\DataObjects\Diagnostics;

use Twig\Markup;

class NotificationItem
{
    /** @var Markup */
    private $heading;

    /** @var Markup */
    private $message;

    public function __construct(Markup $heading, Markup $message)
    {
        $this->heading = $heading;
        $this->message = $message;
    }

    public function getHeading(): Markup
    {
        return $this->heading;
    }

    public function getMessage(): Markup
    {
        return $this->message;
    }
}
