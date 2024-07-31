<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Rule;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<Rule>
 */
class RulesCollection extends Collection
{
    protected static function supports(): array
    {
        return [Rule::class];
    }
}
