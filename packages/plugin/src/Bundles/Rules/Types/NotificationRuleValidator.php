<?php

namespace Solspace\Freeform\Bundles\Rules\Types;

use Solspace\Freeform\Bundles\Rules\ConditionValidator;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;

class NotificationRuleValidator
{
    public function __construct(
        private ConditionValidator $conditionValidator,
    ) {}

    public function isPassing(Conditional $notification, Form $form): bool
    {
        $rule = $notification->getRule();
        if (!$rule) {
            return true;
        }

        $conditions = $rule->getConditions();

        $matchesSome = false;
        $matchesAll = true;
        foreach ($conditions as $condition) {
            $field = $form->get($condition->getField());
            if (!$field) {
                continue;
            }

            $postedValue = $field->getValue();

            $valueMatch = $this->conditionValidator->validate($condition, $postedValue);
            if ($valueMatch) {
                $matchesSome = true;
            } else {
                $matchesAll = false;
            }
        }

        $shouldSend = $rule->isSend();

        return match ($rule->getCombinator()) {
            NotificationRule::COMBINATOR_AND => $shouldSend ? $matchesAll : !$matchesAll,
            NotificationRule::COMBINATOR_OR => $shouldSend ? $matchesSome : !$matchesSome,
        };
    }
}
