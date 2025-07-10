<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Favorite;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Favorite>
 */
class FavoritesCollection extends Collection
{
    protected static function supports(): array
    {
        return [Favorite::class];
    }
}
