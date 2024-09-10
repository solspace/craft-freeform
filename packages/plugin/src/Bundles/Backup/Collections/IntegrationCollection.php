<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Integration;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Integration>
 */
class IntegrationCollection extends Collection
{
    protected static function supports(): array
    {
        return [Integration::class];
    }
}
