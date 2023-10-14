<?php

namespace Solspace\Freeform\Library\Helpers;

class EditionHelper
{
    private ?int $editionIndex = null;

    public function __construct(
        private string $edition,
        private array $tiers
    ) {
        $index = array_search($edition, $tiers, true);
        if (false !== $index) {
            $this->editionIndex = $index;
        }
    }

    public function getEditions(): array
    {
        return $this->tiers;
    }

    public function is(string $edition): bool
    {
        return $edition === $this->edition;
    }

    public function isAtLeast(string $edition): bool
    {
        if (null === $this->editionIndex) {
            return false;
        }

        $editionIndex = array_search($edition, $this->tiers, true);

        return false !== $editionIndex && $this->editionIndex >= $editionIndex;
    }

    public function isAtMost(string $edition): bool
    {
        if (null === $this->editionIndex) {
            return false;
        }

        $editionIndex = array_search($edition, $this->tiers, true);

        return false !== $editionIndex && $this->editionIndex <= $editionIndex;
    }

    public function isBelow(string $edition): bool
    {
        if (null === $this->editionIndex) {
            return false;
        }

        $editionIndex = array_search($edition, $this->tiers, true);

        return false !== $editionIndex && $this->editionIndex < $editionIndex;
    }
}
