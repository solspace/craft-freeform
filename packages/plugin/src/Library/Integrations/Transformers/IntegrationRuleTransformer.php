<?php

namespace Solspace\Freeform\Library\Integrations\Transformers;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Rules\Types\IntegrationRuleProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;

class IntegrationRuleTransformer implements TransformerInterface
{
    public function __construct(
        private IntegrationRuleProvider $ruleProvider
    ) {}

    public function transform($value, ?Form $form = null): ?IntegrationRule
    {
        if (\is_string($value)) {
            return $this->ruleProvider->getByUid($value);
        }

        return null;
    }

    public function reverseTransform($value): mixed
    {
        if ($value instanceof IntegrationRule) {
            return $value->getUid();
        }

        return null;
    }
}
