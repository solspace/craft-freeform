<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Library\Rules\Types\FieldRule;

class RuleValidator
{
    public function __construct(
        private RuleProvider $ruleProvider,
    ) {
    }

    public function isFieldHidden(Form $form, FieldInterface $field): bool
    {
        $rule = $this->ruleProvider->getFieldRule($form, $field);
        if (!$rule) {
            return false;
        }

        $conditions = $rule->getConditions();

        $matchesSome = false;
        $matchesAll = true;
        foreach ($conditions as $condition) {
            $isConditionFieldHidden = $this->isFieldHidden($form, $condition->getField());

            $postedValue = $isConditionFieldHidden ? null : $condition->getField()->getValue();
            $expectedValue = $condition->getValue();

            $valueMatch = match ($condition->getOperator()) {
                Condition::TYPE_EQUALS => strtolower($postedValue) === strtolower($expectedValue),
                Condition::TYPE_NOT_EQUALS => strtolower($postedValue) !== strtolower($expectedValue),
                Condition::TYPE_CONTAINS => str_contains(strtolower($postedValue), strtolower($expectedValue)),
                Condition::TYPE_NOT_CONTAINS => !str_contains(strtolower($postedValue), strtolower($expectedValue)),
                Condition::TYPE_GREATER_THAN => $postedValue > $expectedValue,
                Condition::TYPE_GREATER_THAN_OR_EQUALS => $postedValue >= $expectedValue,
                Condition::TYPE_LESS_THAN => $postedValue < $expectedValue,
                Condition::TYPE_LESS_THAN_OR_EQUALS => $postedValue <= $expectedValue,
                Condition::TYPE_STARTS_WITH => str_starts_with(strtolower($postedValue), strtolower($expectedValue)),
                Condition::TYPE_ENDS_WITH => str_ends_with(strtolower($postedValue), strtolower($expectedValue)),
            };

            if ($valueMatch) {
                $matchesSome = true;
            } else {
                $matchesAll = false;
            }
        }

        $shouldShow = FieldRule::DISPLAY_SHOW === $rule->getDisplay();

        return match ($rule->getCombinator()) {
            Rule::COMBINATOR_AND => $shouldShow ? !$matchesAll : $matchesAll,
            Rule::COMBINATOR_OR => $shouldShow ? !$matchesSome : $matchesSome,
        };
    }
}
