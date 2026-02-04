<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Library\Rules\Condition;

class ConditionValidator
{
    public function validate(Condition $condition, mixed $value): bool
    {
        $expectedValue = $condition->getValue();
        $operator = $condition->getOperator();

        $expectedList = null;
        if (\is_string($expectedValue)) {
            $expectedValueTrimmed = trim($expectedValue);
            if ('' !== $expectedValueTrimmed && preg_match('/^\s*\[.*\]\s*$/s', $expectedValueTrimmed)) {
                $decoded = json_decode($expectedValueTrimmed, true);
                if (\JSON_ERROR_NONE === json_last_error() && \is_array($decoded)) {
                    $expectedList = array_map(
                        static fn ($item) => strtolower(trim((string) $item)),
                        array_values($decoded),
                    );
                }
            }
        }

        if (\is_array($value)) {
            if (preg_match('/^[\[{].*[]}]$/', $expectedValue)) {
                $expectedValue = json_decode($expectedValue, true);
                $expectedValue = array_map('trim', $expectedValue);

                $hasCommonValue = [] !== array_intersect($value, $expectedValue);

                return match ($operator) {
                    Condition::TYPE_EQUALS => $expectedValue == $value,
                    Condition::TYPE_NOT_EQUALS => $expectedValue != $value,
                    Condition::TYPE_CONTAINS, Condition::TYPE_IS_ONE_OF => $hasCommonValue,
                    Condition::TYPE_NOT_CONTAINS, Condition::TYPE_IS_NOT_ONE_OF => !$hasCommonValue,
                    Condition::TYPE_IS_EMPTY => empty($value),
                    Condition::TYPE_IS_NOT_EMPTY => !empty($value),
                    default => false,
                };
            }

            return match ($operator) {
                Condition::TYPE_EQUALS => $expectedValue === implode(',', $value),
                Condition::TYPE_NOT_EQUALS => $expectedValue !== implode(',', $value),
                Condition::TYPE_CONTAINS, Condition::TYPE_IS_ONE_OF => \in_array($expectedValue, $value, true),
                Condition::TYPE_NOT_CONTAINS, Condition::TYPE_IS_NOT_ONE_OF => !\in_array($expectedValue, $value, true),
                Condition::TYPE_IS_EMPTY => empty($value),
                Condition::TYPE_IS_NOT_EMPTY => !empty($value),
                default => false,
            };
        }

        if (null !== $expectedList && \in_array($operator, [Condition::TYPE_IS_ONE_OF, Condition::TYPE_IS_NOT_ONE_OF], true)) {
            $valueNormalized = strtolower(trim((string) $value));

            if (0 === \count($expectedList)) {
                $isEmpty = '' === $valueNormalized;

                return Condition::TYPE_IS_ONE_OF === $operator ? $isEmpty : !$isEmpty;
            }

            $inList = \in_array($valueNormalized, $expectedList, true);

            return Condition::TYPE_IS_ONE_OF === $operator ? $inList : !$inList;
        }

        $expectedValue = trim((string) $expectedValue);

        $valueString = (string) $value;

        return match ($operator) {
            Condition::TYPE_EQUALS => strtolower($valueString) === strtolower($expectedValue),
            Condition::TYPE_NOT_EQUALS => strtolower($valueString) !== strtolower($expectedValue),
            Condition::TYPE_CONTAINS => str_contains(strtolower($valueString), strtolower($expectedValue)),
            Condition::TYPE_NOT_CONTAINS => !str_contains(strtolower($valueString), strtolower($expectedValue)),
            Condition::TYPE_GREATER_THAN => $value > $expectedValue,
            Condition::TYPE_GREATER_THAN_OR_EQUALS => $value >= $expectedValue,
            Condition::TYPE_LESS_THAN => $value < $expectedValue,
            Condition::TYPE_LESS_THAN_OR_EQUALS => $value <= $expectedValue,
            Condition::TYPE_STARTS_WITH => str_starts_with(strtolower($valueString), strtolower($expectedValue)),
            Condition::TYPE_ENDS_WITH => str_ends_with(strtolower($valueString), strtolower($expectedValue)),
            Condition::TYPE_IS_EMPTY => empty($value),
            Condition::TYPE_IS_NOT_EMPTY => !empty($value),
            Condition::TYPE_IS_ONE_OF => $expectedValue === $value,
            Condition::TYPE_IS_NOT_ONE_OF => $expectedValue !== $value,
        };
    }
}
