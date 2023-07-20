<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Collections\Collection;

interface RuleInterface
{
    public const COMBINATOR_AND = 'and';
    public const COMBINATOR_OR = 'or';

    public function getId(): int;

    public function getUid(): string;

    /**
     * @return Collection<Condition>
     */
    public function getConditions(): ConditionCollection;

    public function getCombinator(): string;
}
