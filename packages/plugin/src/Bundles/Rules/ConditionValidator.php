<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Library\Rules\Condition;

class ConditionValidator
{
    public function validate(Condition $condition, mixed $value): bool
    {
        $expectedValue = $condition->getValue();

        if (\is_array($value)) {
            return match ($condition->getOperator()) {
                Condition::TYPE_EQUALS => $expectedValue === implode(',', $value),
                Condition::TYPE_NOT_EQUALS => $expectedValue !== implode(',', $value),
                Condition::TYPE_CONTAINS => \in_array($expectedValue, $value, true),
                Condition::TYPE_NOT_CONTAINS => !\in_array($expectedValue, $value, true),
                default => false,
            };
        }

        return match ($condition->getOperator()) {
            Condition::TYPE_EQUALS => strtolower($value) === strtolower($expectedValue),
            Condition::TYPE_NOT_EQUALS => strtolower($value) !== strtolower($expectedValue),
            Condition::TYPE_CONTAINS => str_contains(strtolower($value), strtolower($expectedValue)),
            Condition::TYPE_NOT_CONTAINS => !str_contains(strtolower($value), strtolower($expectedValue)),
            Condition::TYPE_GREATER_THAN => $value > $expectedValue,
            Condition::TYPE_GREATER_THAN_OR_EQUALS => $value >= $expectedValue,
            Condition::TYPE_LESS_THAN => $value < $expectedValue,
            Condition::TYPE_LESS_THAN_OR_EQUALS => $value <= $expectedValue,
            Condition::TYPE_STARTS_WITH => str_starts_with(strtolower($value), strtolower($expectedValue)),
            Condition::TYPE_ENDS_WITH => str_ends_with(strtolower($value), strtolower($expectedValue)),
        };
    }
}
