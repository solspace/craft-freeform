<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

class Rule implements IdentificatorInterface
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

    public function getId(): int
    {
        return $this->id;
    }

    public function getUid(): string
    {
        return $this->uid;
    }

    public function getCombinator(): string
    {
        return $this->combinator;
    }

    public function getConditions(): ConditionCollection
    {
        return $this->conditions;
    }
}
