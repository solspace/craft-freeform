<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Library\Rules\Condition;

class ConditionValidator
{
    public function validate(Condition $condition, mixed $value): bool
    {
        $expectedValue = $condition->getValue();

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
