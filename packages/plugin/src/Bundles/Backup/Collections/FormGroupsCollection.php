<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\FormGroup;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<FormGroup>
 */
class FormGroupsCollection extends Collection
{
    protected static function supports(): array
    {
        return [FormGroup::class];
    }
}
