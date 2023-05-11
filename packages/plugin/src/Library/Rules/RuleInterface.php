<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Collections\Collection;

interface RuleInterface
{
    public const COMBINATOR_AND = 'and';
    public const COMBINATOR_OR = 'or';

    public function getUid(): string;

    public function getId(): int;

    /**
     * @return Collection<Condition>
     */
    public function getConditions(): Collection;

    public function getCombinator(): string;
}
