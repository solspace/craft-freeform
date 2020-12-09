<?php

namespace Solspace\Freeform\Library\Rules;

class FieldRule extends BaseRule implements \JsonSerializable
{
    /** @var string */
    private $hash;

    /** @var bool */
    private $show;

    /**
     * FieldRule constructor.
     */
    public function __construct(string $hash, bool $show, bool $matchAll, array $criteria, callable $getFieldProps)
    {
        $this->hash = $hash;
        $this->show = $show;

        parent::__construct($matchAll, $criteria, $getFieldProps);
    }

    public function getHash(): string
    {
        return $this->hash;
    }

    public function isShown(): bool
    {
        return $this->show;
    }

    public function isHidden(): bool
    {
        return !$this->isShown();
    }

    /**
     * {@inheritDoc}
     */
    public function jsonSerialize()
    {
        return [
            'show' => $this->isShown(),
            'type' => $this->isMatchAll() ? self::TYPE_MATCH_ALL : self::TYPE_MATCH_ANY,
            'criteria' => $this->getCriteria(),
        ];
    }
}
