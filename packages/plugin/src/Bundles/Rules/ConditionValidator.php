<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Library\Rules\Condition;

class ConditionValidator
{
    public function validate(Condition $condition, mixed $value): bool
    {
        $expectedValue = $condition->getValue();
        $operator = $condition->getOperator();

        if (\in_array($operator, [Condition::TYPE_IS_ONE_OF, Condition::TYPE_IS_NOT_ONE_OF], true)) {
            $expectedList = $this->normalizeList($expectedValue, true);
            $actualList = $this->normalizeList($value, true);

            $hasCommonValue = !empty(array_intersect($actualList, $expectedList));

            // Preserve front-end behavior for an empty "one of" set.
            $matches = [] === $expectedList ? [] === $actualList : $hasCommonValue;

            return Condition::TYPE_IS_ONE_OF === $operator ? $matches : !$matches;
        }

        if (\is_array($value)) {
            $actualList = $this->normalizeList($value, true);
            $decodedExpected = $this->decodeArrayString($expectedValue);

            if (null !== $decodedExpected) {
                $expectedList = $this->normalizeList($decodedExpected, true);
                $hasCommonValue = [] !== array_intersect($actualList, $expectedList);

                return match ($operator) {
                    Condition::TYPE_EQUALS => $expectedList === $actualList,
                    Condition::TYPE_NOT_EQUALS => $expectedList !== $actualList,
                    Condition::TYPE_CONTAINS => $hasCommonValue,
                    Condition::TYPE_NOT_CONTAINS => !$hasCommonValue,
                    Condition::TYPE_IS_EMPTY => [] === $actualList,
                    Condition::TYPE_IS_NOT_EMPTY => [] !== $actualList,
                    default => false,
                };
            }

            $expectedScalar = $this->normalizeScalar($expectedValue);

            return match ($operator) {
                Condition::TYPE_EQUALS => $expectedScalar === implode(',', $actualList),
                Condition::TYPE_NOT_EQUALS => $expectedScalar !== implode(',', $actualList),
                Condition::TYPE_CONTAINS => \in_array($expectedScalar, $actualList, true),
                Condition::TYPE_NOT_CONTAINS => !\in_array($expectedScalar, $actualList, true),
                Condition::TYPE_IS_EMPTY => [] === $actualList,
                Condition::TYPE_IS_NOT_EMPTY => [] !== $actualList,
                default => false,
            };
        }

        $expectedScalar = $this->normalizeScalar($expectedValue);
        $actualScalar = $this->normalizeScalar($value);

        return match ($operator) {
            Condition::TYPE_EQUALS => strtolower($actualScalar) === strtolower($expectedScalar),
            Condition::TYPE_NOT_EQUALS => strtolower($actualScalar) !== strtolower($expectedScalar),
            Condition::TYPE_CONTAINS => str_contains(strtolower($actualScalar), strtolower($expectedScalar)),
            Condition::TYPE_NOT_CONTAINS => !str_contains(strtolower($actualScalar), strtolower($expectedScalar)),
            Condition::TYPE_GREATER_THAN => $this->compare($actualScalar, $expectedScalar, '>'),
            Condition::TYPE_GREATER_THAN_OR_EQUALS => $this->compare($actualScalar, $expectedScalar, '>='),
            Condition::TYPE_LESS_THAN => $this->compare($actualScalar, $expectedScalar, '<'),
            Condition::TYPE_LESS_THAN_OR_EQUALS => $this->compare($actualScalar, $expectedScalar, '<='),
            Condition::TYPE_STARTS_WITH => str_starts_with(strtolower($actualScalar), strtolower($expectedScalar)),
            Condition::TYPE_ENDS_WITH => str_ends_with(strtolower($actualScalar), strtolower($expectedScalar)),
            Condition::TYPE_IS_EMPTY => '' === $actualScalar,
            Condition::TYPE_IS_NOT_EMPTY => '' !== $actualScalar,
        };
    }

    private function normalizeScalar(mixed $value): string
    {
        if (null === $value) {
            return '';
        }

        if (\is_bool($value)) {
            return $value ? '1' : '0';
        }

        return trim((string) $value);
    }

    private function normalizeList(mixed $value, bool $allowCsvSplit = false): array
    {
        if (\is_array($value)) {
            return array_values(
                array_map(
                    fn (mixed $item) => $this->normalizeScalar($item),
                    array_filter($value, static fn (mixed $item) => null !== $item)
                )
            );
        }

        $stringValue = $this->normalizeScalar($value);
        if ('' === $stringValue) {
            return [];
        }

        $decoded = $this->decodeArrayString($stringValue);
        if (null !== $decoded) {
            return $this->normalizeList($decoded, $allowCsvSplit);
        }

        if ($allowCsvSplit && str_contains($stringValue, ',')) {
            return $this->normalizeList(explode(',', $stringValue), false);
        }

        return [$stringValue];
    }

    private function decodeArrayString(mixed $value): ?array
    {
        if (!\is_string($value)) {
            return null;
        }

        $decoded = json_decode($value, true);
        if (\JSON_ERROR_NONE === json_last_error() && \is_array($decoded)) {
            return $decoded;
        }

        return null;
    }

    private function compare(string $actual, string $expected, string $operator): bool
    {
        $left = is_numeric($actual) ? (float) $actual : $actual;
        $right = is_numeric($expected) ? (float) $expected : $expected;

        return match ($operator) {
            '>' => $left > $right,
            '>=' => $left >= $right,
            '<' => $left < $right,
            '<=' => $left <= $right,
            default => false,
        };
    }
}
