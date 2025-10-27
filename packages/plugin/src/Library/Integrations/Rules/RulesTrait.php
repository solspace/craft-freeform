<?php

namespace Solspace\Freeform\Library\Integrations\Rules;

use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Transformers\IntegrationRuleTransformer;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;

trait RulesTrait
{
    #[Flag(IntegrationInterface::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Rules')]
    #[Input\Boolean(
        label: 'Enable Rules',
        instructions: 'Enable rules to control when this integration is triggered.',
        order: 998,
    )]
    protected bool $enableRules = false;

    #[Flag(IntegrationInterface::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.enableRules)')]
    #[ValueTransformer(IntegrationRuleTransformer::class)]
    #[Input\Special\ConditionalIntegrationRule(
        label: 'Rules',
        instructions: 'Specify when this integration should be triggered.',
        order: 999,
    )]
    protected ?IntegrationRule $rule;

    public function isEnableRules(): bool
    {
        return $this->enableRules;
    }

    public function getRule(): ?IntegrationRule
    {
        return $this->rule;
    }
}
