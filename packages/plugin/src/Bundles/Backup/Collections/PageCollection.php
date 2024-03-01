<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Page;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Page>
 */
class PageCollection extends Collection
{
    protected static function supports(): array
    {
        return [Page::class];
    }
}
