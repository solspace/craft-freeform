<?php

namespace Solspace\Freeform\Library\Helpers;

class CronExpressionHelper
{
    private const MONTH_ALIASES = [
        'JAN' => 1,
        'FEB' => 2,
        'MAR' => 3,
        'APR' => 4,
        'MAY' => 5,
        'JUN' => 6,
        'JUL' => 7,
        'AUG' => 8,
        'SEP' => 9,
        'OCT' => 10,
        'NOV' => 11,
        'DEC' => 12,
    ];

    private const WEEKDAY_ALIASES = [
        'SUN' => 0,
        'MON' => 1,
        'TUE' => 2,
        'WED' => 3,
        'THU' => 4,
        'FRI' => 5,
        'SAT' => 6,
    ];

    public static function isValid(string $expression): bool
    {
        try {
            self::parse($expression);

            return true;
        } catch (\InvalidArgumentException) {
            return false;
        }
    }

    public static function isDue(string $expression, \DateTimeInterface $date): bool
    {
        [$minute, $hour, $dayOfMonth, $month, $dayOfWeek] = self::parse($expression);

        if (!self::matches($minute, (int) $date->format('i')) || !self::matches($hour, (int) $date->format('G')) || !self::matches($month, (int) $date->format('n'))) {
            return false;
        }

        $matchesDayOfMonth = self::matches($dayOfMonth, (int) $date->format('j'));

        $weekday = (int) $date->format('w');

        $matchesDayOfWeek = self::matches($dayOfWeek, $weekday) || (0 === $weekday && self::matches($dayOfWeek, 7));

        // Cron treats day-of-month and day-of-week as alternatives when both are set.
        if ('*' !== $dayOfMonth && '*' !== $dayOfWeek) {
            return $matchesDayOfMonth || $matchesDayOfWeek;
        }

        return $matchesDayOfMonth && $matchesDayOfWeek;
    }

    /**
     * @return array<int, string>
     */
    private static function parse(string $expression): array
    {
        $parts = preg_split('/\s+/', trim($expression));
        if (5 !== \count($parts)) {
            throw new \InvalidArgumentException('A cron expression must have five parts.');
        }

        $ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
        foreach ($parts as $index => $part) {
            $parts[$index] = self::normaliseAliases($part, $index);

            self::validateField($parts[$index], ...$ranges[$index]);
        }

        return $parts;
    }

    private static function normaliseAliases(string $field, int $index): string
    {
        $aliases = 3 === $index ? self::MONTH_ALIASES : (4 === $index ? self::WEEKDAY_ALIASES : []);

        return strtr(strtoupper($field), $aliases);
    }

    private static function validateField(string $field, int $min, int $max): void
    {
        foreach (explode(',', $field) as $part) {
            if (!preg_match('/^(\*|\d+(?:-\d+)?)(?:\/\d+)?$/', $part)) {
                throw new \InvalidArgumentException('Invalid cron field.');
            }

            [$range, $step] = array_pad(explode('/', $part, 2), 2, null);
            if (null !== $step && (int) $step < 1) {
                throw new \InvalidArgumentException('Cron steps must be greater than zero.');
            }

            if ('*' === $range) {
                continue;
            }

            [$start, $end] = array_pad(explode('-', $range, 2), 2, $range);
            if ((int) $start < $min || (int) $end > $max || (int) $start > (int) $end) {
                throw new \InvalidArgumentException('Cron value is outside its valid range.');
            }
        }
    }

    private static function matches(string $field, int $value): bool
    {
        foreach (explode(',', $field) as $part) {
            [$range, $step] = array_pad(explode('/', $part, 2), 2, null);

            if ('*' === $range) {
                $start = 0;
                $end = \PHP_INT_MAX;
            } else {
                [$start, $end] = array_pad(explode('-', $range, 2), 2, $range);
                $start = (int) $start;
                $end = (int) $end;
            }

            if ($value >= $start && $value <= $end && (null === $step || 0 === ($value - $start) % (int) $step)) {
                return true;
            }
        }

        return false;
    }
}
