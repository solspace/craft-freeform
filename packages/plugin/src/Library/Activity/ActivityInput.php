<?php

namespace Solspace\Freeform\Library\Activity;

class ActivityInput
{
    public static function filters(array $params): array
    {
        $filters = [
            'q' => mb_substr(trim(self::text($params['q'] ?? '')), 0, 80),
            'category' => self::text($params['category'] ?? ''),
            'level' => self::text($params['level'] ?? ''),
            'resolution' => self::text($params['resolution'] ?? ''),
            'formId' => self::id($params['formId'] ?? 0),
            'submissionId' => self::id($params['submissionId'] ?? 0),
            'days' => self::id($params['days'] ?? 0),
        ];
        foreach (['category', 'level', 'resolution'] as $key) {
            if ('all' === $filters[$key]) {
                $filters[$key] = '';
            }
        }
        if (!\in_array($filters['category'], ['', 'system', 'submissions', 'spam', 'email', 'integrations', 'forms'], true)
            || !\in_array($filters['level'], ['', ...array_keys(ActivityPolicy::LEVEL_LABELS)], true)
            || !\in_array($filters['resolution'], ['', 'open', 'resolved'], true)
            || $filters['days'] > 365) {
            throw new \InvalidArgumentException('Invalid activity filter.');
        }

        return $filters;
    }

    public static function id(mixed $value): int
    {
        if ('' === $value || null === $value) {
            return 0;
        }
        if ((!\is_string($value) && !\is_int($value)) || false === filter_var($value, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]])) {
            throw new \InvalidArgumentException('Invalid activity identifier.');
        }

        return (int) $value;
    }

    public static function enabled(mixed $value): string
    {
        if (!\in_array($value, [true, false, 0, 1, '0', '1', '', 'true', 'false'], true)) {
            throw new \InvalidArgumentException('Invalid activity recording setting.');
        }

        return \in_array($value, [true, 1, '1', 'true'], true) ? '1' : '0';
    }

    public static function technicalLogging(array $params): array
    {
        $settings = [];
        if (\array_key_exists('loggingLevel', $params)) {
            if (!\in_array($params['loggingLevel'], ['error', 'info', 'debug'], true)) {
                throw new \InvalidArgumentException('Invalid technical file logging level.');
            }
            $settings['loggingLevel'] = $params['loggingLevel'];
        }

        return $settings;
    }

    public static function loggingStyle(mixed $value): string
    {
        if (!\in_array($value, ['activity', 'classic', 'none'], true)) {
            throw new \InvalidArgumentException('Invalid logging style.');
        }

        return $value;
    }

    private static function text(mixed $value): string
    {
        if (!\is_string($value)) {
            throw new \InvalidArgumentException('Invalid activity filter.');
        }

        return $value;
    }
}
