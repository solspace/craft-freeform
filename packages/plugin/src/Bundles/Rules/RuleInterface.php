<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Library\Collections\Collection;

interface RuleInterface
{
    public const COMBINATOR_AND = 'and';
    public const COMBINATOR_OR = 'or';

    public function isTriggerOnMatch(): bool;

    public function getCombinator(): string;

    /**
     * @return Collection<Condition>
     */
    public function getConditions(): Collection;
}
