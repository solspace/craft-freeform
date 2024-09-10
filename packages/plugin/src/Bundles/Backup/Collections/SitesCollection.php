<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Site;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Site>
 */
class SitesCollection extends Collection
{
    protected static function supports(): array
    {
        return [Site::class];
    }
}
