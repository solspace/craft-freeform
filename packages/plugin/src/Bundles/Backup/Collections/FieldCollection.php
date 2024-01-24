<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Field>
 */
class FieldCollection extends Collection
{
    protected static function supports(): array
    {
        return [Field::class];
    }
}
