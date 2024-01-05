<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\DTO;

class AnswerBreakdown implements \JsonSerializable
{
    private int $votes;
    private ?int $ranking;

    public function __construct(
        private FieldTotals $fieldTotals,
        private string $label,
        private string $value,
    ) {
        $this->votes = 0;
        $this->ranking = null;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getVotes(): int
    {
        return $this->votes;
    }

    public function getRanking(): ?int
    {
        return $this->ranking;
    }

    public function setRanking(int $rank): void
    {
        $this->ranking = $rank;
    }

    public function incrementVotes(int $count = 1): void
    {
        $this->votes += $count;
        $this->fieldTotals->getBreakdown()->rank();
    }

    public function getPercentage(): float
    {
        $totalVotes = $this->fieldTotals->getVotes();

        if (!$totalVotes) {
            $percentage = 0;
        } else {
            $percentage = ($this->votes / $totalVotes) * 100;
        }

        return (float) number_format($percentage, 2, '.', '');
    }

    public function jsonSerialize(): array
    {
        return [
            'label' => $this->getLabel(),
            'value' => $this->getValue(),
            'votes' => $this->getVotes(),
            'ranking' => $this->getRanking(),
            'percentage' => $this->getPercentage(),
        ];
    }
}
