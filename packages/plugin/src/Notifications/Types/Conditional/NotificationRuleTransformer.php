<?php

namespace Solspace\Freeform\Notifications\Types\Conditional;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;

class NotificationRuleTransformer implements TransformerInterface
{
    public function __construct(
        private NotificationRuleProvider $ruleProvider
    ) {}

    public function transform($value, ?Form $form = null): ?NotificationRule
    {
        if (\is_string($value)) {
            return $this->ruleProvider->getByUid($value);
        }

        return null;
    }

    public function reverseTransform($value): mixed
    {
        if ($value instanceof NotificationRule) {
            return $value->getUid();
        }

        return null;
    }
}
