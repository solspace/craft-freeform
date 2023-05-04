<?php

namespace Solspace\Freeform\Notifications\Types\Conditional;

use Solspace\Freeform\Bundles\Rules\RuleInterface;
use Solspace\Freeform\Library\Collections\Collection;

class ConditionalNotificationRule implements RuleInterface
{
    public function __construct(
        private bool $send,
        private string $combinator,
        private Collection $conditions,
    ) {
    }

    public function isTriggerOnMatch(): bool
    {
        return $this->send;
    }

    public function getCombinator(): string
    {
        return $this->combinator;
    }

    public function getConditions(): Collection
    {
        return $this->conditions;
    }
}
