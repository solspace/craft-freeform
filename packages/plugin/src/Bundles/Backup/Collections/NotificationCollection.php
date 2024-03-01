<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Notification;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Notification>
 */
class NotificationCollection extends Collection
{
    protected static function supports(): array
    {
        return [Notification::class];
    }
}
