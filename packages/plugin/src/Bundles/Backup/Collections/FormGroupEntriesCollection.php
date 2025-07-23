<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\FormGroupEntry;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<FormGroupEntry>
 */
class FormGroupEntriesCollection extends Collection
{
    protected static function supports(): array
    {
        return [FormGroupEntry::class];
    }
}
