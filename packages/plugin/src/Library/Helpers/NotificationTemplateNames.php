<?php

namespace Solspace\Freeform\Library\Helpers;

final class NotificationTemplateNames
{
    public static function unique(string $name, string $handle, callable $exists): array
    {
        if ('' === $handle || !$exists($handle)) {
            return [$name, $handle];
        }

        preg_match('/^(.*?)(?:-?(\d+))?$/D', $handle, $matches);
        $baseHandle = $matches[1];
        $number = max(2, (int) ($matches[2] ?? 1) + 1);
        $baseName = trim((string) preg_replace('/\s*\d+$/', '', trim($name)));

        do {
            $handle = $baseHandle.$number;
            $name = $baseName.' '.$number;
            ++$number;
        } while ($exists($handle));

        return [$name, $handle];
    }
}
