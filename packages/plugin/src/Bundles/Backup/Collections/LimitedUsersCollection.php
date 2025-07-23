<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\LimitedUsers;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<LimitedUsers>
 */
class LimitedUsersCollection extends Collection
{
    protected static function supports(): array
    {
        return [LimitedUsers::class];
    }
}
