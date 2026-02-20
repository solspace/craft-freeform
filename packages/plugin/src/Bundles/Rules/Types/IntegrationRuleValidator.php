<?php

namespace Solspace\Freeform\Bundles\Rules\Types;

use Solspace\Freeform\Bundles\Rules\ConditionValidator;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Rules\RulesBasedInterface;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;

class IntegrationRuleValidator
{
    public function __construct(
        private ConditionValidator $conditionValidator,
    ) {}

    public function isPassing(IntegrationInterface $integration, Form $form): bool
    {
        if (!$integration instanceof RulesBasedInterface) {
            return true;
        }

        if (!$integration->isEnableRules()) {
            return true;
        }

        $rule = $integration->getRule();
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
            if ($field instanceof CheckboxField) {
                $postedValue = $field->isChecked() ? '1' : '';
            }

            $valueMatch = $this->conditionValidator->validate($condition, $postedValue);
            if ($valueMatch) {
                $matchesSome = true;
            } else {
                $matchesAll = false;
            }
        }

        $shouldPush = $rule->isPush();

        return match ($rule->getCombinator()) {
            NotificationRule::COMBINATOR_AND => $shouldPush ? $matchesAll : !$matchesAll,
            NotificationRule::COMBINATOR_OR => $shouldPush ? $matchesSome : !$matchesSome,
        };
    }
}
