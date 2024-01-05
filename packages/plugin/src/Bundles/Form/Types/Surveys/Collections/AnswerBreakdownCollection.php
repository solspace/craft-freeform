<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Collections;

use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\AnswerBreakdown;
use Solspace\Freeform\Library\Collections\Collection;

/**
 * @extends Collection<AnswerBreakdown>
 */
class AnswerBreakdownCollection extends Collection implements \JsonSerializable
{
    public function cloneRanked($top): self
    {
        $ranked = $this->getRankedValues();
        if (false === $top || $top < 0) {
            $ranked = array_reverse($ranked, true);
        }

        if (is_numeric($top)) {
            $ranked = \array_slice($ranked, $bottom ?? 0, abs($top), true);
        }

        $collection = new self();
        foreach ($ranked as $value => $votes) {
            $collection->add($this->get($value), $value);
        }

        return $collection;
    }

    public function rank(): void
    {
        $ranked = $this->getRankedValues();

        $rank = 1;
        foreach ($ranked as $value => $votes) {
            $breakdown = $this->items[$value];
            $breakdown->setRanking($rank++);
        }
    }

    public function jsonSerialize(): array
    {
        return array_values($this->items);
    }

    private function getRankedValues(): array
    {
        $ranked = [];

        foreach ($this->items as $breakdown) {
            $ranked[$breakdown->getValue()] = $breakdown->getVotes();
        }

        arsort($ranked, \SORT_NUMERIC);

        return $ranked;
    }
}
