<?php

namespace Solspace\Freeform\Bundles\Notifications\Collections;

use Solspace\Freeform\Notifications\NotificationInterface;

class NotificationCollection
{
    /** @var NotificationInterface[] */
    private array $notifications = [];

    public function add(NotificationInterface $notification): self
    {
        $this->notifications[] = $notification;

        return $this;
    }

    public function getNotifications(): array
    {
        return $this->notifications;
    }
}
