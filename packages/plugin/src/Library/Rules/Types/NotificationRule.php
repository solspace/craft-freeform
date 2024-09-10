<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;

class NotificationRule extends Rule
{
    private Conditional $notification;
    private bool $send;

    public function getNotification(): Conditional
    {
        return $this->notification;
    }

    public function setNotification(Conditional $notification): self
    {
        $this->notification = $notification;

        return $this;
    }

    public function isSend(): bool
    {
        return $this->send ?? true;
    }

    public function setSend(bool $send): self
    {
        $this->send = $send;

        return $this;
    }
}
