<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\RuleCondition;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<RuleCondition>
 */
class RuleConditionCollection extends Collection
{
    protected static function supports(): array
    {
        return [RuleCondition::class];
    }
}
