<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Row;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Row>
 */
class RowCollection extends Collection
{
    protected static function supports(): array
    {
        return [Row::class];
    }
}
