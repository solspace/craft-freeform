<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\Collections\RuleConditionCollection;

class Rule
{
    public string $uid;
    public string $type;
    public string $combinator;
    public RuleConditionCollection $conditions;
    public array $metadata = [];

    public function __construct()
    {
        $this->conditions = new RuleConditionCollection();
    }
}
