<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\DTO;

use Solspace\Freeform\Bundles\Form\Types\Surveys\Collections\AnswerBreakdownCollection;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;

class FieldTotals implements \IteratorAggregate, \Countable, \ArrayAccess, \JsonSerializable
{
    private const RANK_BY_TOP_FIELDS = [TextField::class, TextareaField::class];

    private FieldInterface $field;

    private AnswerBreakdownCollection $breakdown;

    private int $skipped;

    public function __construct(FieldInterface $field)
    {
        $this->field = $field;
        $this->skipped = 0;
        $this->breakdown = new AnswerBreakdownCollection();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getSkipped(): int
    {
        return $this->skipped;
    }

    public function incrementSkipped(int $count = 1): void
    {
        $this->skipped += $count;
    }

    public function getVotes(): int
    {
        $votes = 0;
        foreach ($this->breakdown as $breakdown) {
            $votes += $breakdown->getVotes();
        }

        return $votes;
    }

    public function getAverage(): ?float
    {
        if (0 === \count($this->breakdown)) {
            return null;
        }

        $sum = 0;
        $count = 0;
        foreach ($this->breakdown as $breakdown) {
            if (!is_numeric($breakdown->getValue())) {
                return null;
            }

            $sum += (float) $breakdown->getValue() * $breakdown->getVotes();
            $count += $breakdown->getVotes();
        }

        $count = max(1, $count);

        return (float) number_format($sum / $count, 2, '.', '');
    }

    public function getMax(): ?float
    {
        $max = 0;
        foreach ($this->breakdown as $breakdown) {
            if (!is_numeric($breakdown->getValue())) {
                return null;
            }

            $max = max($breakdown->getValue(), $max);
        }

        return $max;
    }

    public function getBreakdown($top = null): AnswerBreakdownCollection
    {
        if (null !== $top) {
            return $this->breakdown->cloneRanked($top);
        }

        return $this->breakdown;
    }

    public function jsonSerialize(): array
    {
        $sortByTop = \in_array(\get_class($this->field), self::RANK_BY_TOP_FIELDS, true) ? true : null;

        return [
            'field' => [
                'id' => $this->field->getId(),
                'handle' => $this->field->getHandle(),
                'label' => $this->field->getLabel(),
                'type' => $this->field->getType(),
                'class' => \get_class($this->field),
                'multiChoice' => $this->field instanceof MultiValueInterface,
            ],
            'average' => $this->getAverage(),
            'max' => $this->getMax(),
            'votes' => $this->getVotes(),
            'skipped' => $this->skipped,
            'breakdown' => $this->getBreakdown($sortByTop),
        ];
    }

    public function getIterator(): iterable
    {
        return $this->breakdown->getIterator();
    }

    public function offsetExists($offset): bool
    {
        return $this->breakdown->offsetExists($offset);
    }

    public function offsetGet($offset)
    {
        return $this->breakdown->offsetGet($offset);
    }

    public function offsetSet($offset, $value): void
    {
        $this->breakdown->offsetSet($offset, $value);
    }

    public function offsetUnset($offset): void
    {
        $this->breakdown->offsetUnset($offset);
    }

    public function count(): int
    {
        return $this->breakdown->count();
    }
}
