<?php

namespace Solspace\Freeform\Library\Helpers;

class FormCardHelper
{
    public const SIZES = ['1x1', '2x1', '1x2', '2x2'];
    public const CONTENT = ['overview', 'activity', 'statistics', 'monitor', 'field'];
    public const RANGES = [7, 30, 90];

    public static function normalizeSize(mixed $size): string
    {
        return \in_array($size, self::SIZES, true) ? $size : '1x1';
    }

    public static function preferenceKey(int $siteId, string $formUid): string
    {
        return 'freeform.cardSize.'.$siteId.'.'.$formUid;
    }

    public static function contentKey(int $siteId, string $formUid): string
    {
        return 'freeform.cardContent.'.$siteId.'.'.$formUid;
    }

    public static function rangeKey(int $siteId): string
    {
        return 'freeform.cardRange.'.$siteId;
    }

    public static function normalizeContent(mixed $value): array
    {
        $value = \is_array($value) ? $value : [];

        return [
            'content' => \in_array($value['content'] ?? null, self::CONTENT, true) ? $value['content'] : 'overview',
            'fieldId' => filter_var($value['fieldId'] ?? null, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) ?: null,
        ];
    }
}
