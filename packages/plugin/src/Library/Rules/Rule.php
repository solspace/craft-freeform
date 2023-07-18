<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\Ignore;

class Rule implements RuleInterface, IdentificatorInterface
{
    public function __construct(
        private int $id,
        private string $uid,
        private string $combinator,
        private ConditionCollection $conditions
    ) {
    }

    #[Ignore]
    public function getNormalizeIdentificator(): int|string|null
    {
        return $this->getUid();
    }

    #[Groups(['builder'])]
    public function isEnabled(): bool
    {
        return true;
    }

    public function getId(): int
    {
        return $this->id;
    }

    #[Groups(['builder'])]
    public function getUid(): string
    {
        return $this->uid;
    }

    #[Groups(['front-end', 'builder'])]
    public function getCombinator(): string
    {
        return $this->combinator;
    }

    #[Groups(['front-end', 'builder'])]
    public function getConditions(): ConditionCollection
    {
        return $this->conditions;
    }
}
