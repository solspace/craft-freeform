<?php

namespace Solspace\Freeform\Library\Rules;

class FieldCriteria implements \JsonSerializable
{
    const OPERAND_EQUALS = '=';
    const OPERAND_NOT_EQUALS = '!=';

    /** @var string */
    private $hash;

    /** @var string */
    private $targetHandle;

    /** @var bool */
    private $equals;

    /** @var string */
    private $value;

    /**
     * FieldCriteria constructor.
     */
    public function __construct(string $hash, string $targetHandle, bool $equals, string $value)
    {
        $this->hash = $hash;
        $this->targetHandle = $targetHandle;
        $this->equals = $equals;
        $this->value = $value;
    }

    public function getHash(): string
    {
        return $this->hash;
    }

    public function getTargetHandle(): string
    {
        return $this->targetHandle;
    }

    public function isEquals(): bool
    {
        return $this->equals;
    }

    public function isNotEquals(): bool
    {
        return !$this->isEquals();
    }

    public function getValue(): string
    {
        return $this->value;
    }

    /**
     * {@inheritDoc}
     */
    public function jsonSerialize()
    {
        return [
            'tgt' => $this->getTargetHandle(),
            'o' => $this->isEquals() ? self::OPERAND_EQUALS : self::OPERAND_NOT_EQUALS,
            'val' => $this->getValue(),
        ];
    }
}
