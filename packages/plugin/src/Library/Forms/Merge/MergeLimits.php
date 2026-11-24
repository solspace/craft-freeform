<?php

namespace Solspace\Freeform\Library\Forms\Merge;

final class MergeLimits
{
    // Keep synchronous requests and the transfer transaction within a bounded workload.
    public const MAX_SUBMISSIONS = 10_000;
    public const MAX_FIELD_VALUES = 250_000;
    public const MAX_VALUE_BYTES = 16 * 1024 * 1024;
    public const MAX_WRITE_BYTES = 2 * 1024 * 1024;
    public const MAX_NEW_FIELDS = 50;

    private const MAX_MAPPING_OPTIONS = 25_000;
    private const MAX_POST_OVERHEAD = 10;
    private const MAX_BATCH_VALUES = 512;
    private const MAX_BATCH_ROWS = 250;

    public static function allowsMapping(int $sourceFields, int $destinations, int $phpInputLimit): bool
    {
        return ($phpInputLimit <= 0 || $sourceFields + self::MAX_POST_OVERHEAD <= $phpInputLimit)
            && $sourceFields * max(1, $destinations) <= self::MAX_MAPPING_OPTIONS;
    }

    public static function submissionLimit(int $fields): int
    {
        return min(self::MAX_SUBMISSIONS, intdiv(self::MAX_FIELD_VALUES, max(1, $fields)));
    }

    public static function batchSize(int $fields): int
    {
        return max(1, min(self::MAX_BATCH_ROWS, intdiv(self::MAX_BATCH_VALUES, max(1, $fields))));
    }
}
