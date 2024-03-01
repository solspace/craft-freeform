<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\NotificationTemplate;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<NotificationTemplate>
 */
class NotificationTemplateCollection extends Collection
{
    protected static function supports(): array
    {
        return [NotificationTemplate::class];
    }
}
