<?php

namespace Solspace\Freeform\Library\Rules;

use Solspace\Freeform\Library\Composer\Components\Properties\PageProperties;

class GotoRule extends BaseRule
{
    /** @var string */
    private $targetPageHash;

    /** @var int */
    private $targetPageIndex;

    /**
     * PageRule constructor.
     */
    public function __construct(string $targetPageHash, bool $matchAll, array $criteria, callable $getFieldProps)
    {
        $this->targetPageHash = $targetPageHash;
        $this->targetPageIndex = PageProperties::getIndex($targetPageHash);

        parent::__construct($matchAll, $criteria, $getFieldProps);
    }

    public function getTargetPageHash(): string
    {
        return $this->targetPageHash;
    }

    public function getTargetPageIndex(): int
    {
        return $this->targetPageIndex;
    }
}
