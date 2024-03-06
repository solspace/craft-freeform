<?php

namespace Solspace\Freeform\Library\Helpers;

class VersionHelper
{
    public static function isCraft4(): bool
    {
        return self::compareVersions(\Craft::$app->getVersion(), '5.0.0') < 0;
    }

    public static function compareVersions(string $version1, string $version2): int
    {
        $v1 = self::extractVersionComponents($version1);
        $v2 = self::extractVersionComponents($version2);

        if ($v1['major'] != $v2['major']) {
            return $v1['major'] - $v2['major'];
        }

        if ($v1['minor'] != $v2['minor']) {
            return $v1['minor'] - $v2['minor'];
        }

        return strcmp($v1['alphaOrBeta'], $v2['alphaOrBeta']);
    }

    public static function extractVersionComponents(string $version): array
    {
        $parts = explode('.', $version);

        $major = $parts[0] ?? 0;
        $minor = $parts[1] ?? 0;

        $alphaOrBeta = '';
        if (isset($parts[2])) {
            if (preg_match('/[a-zA-Z]/', $parts[2])) {
                $alphaOrBeta = $parts[2];
            }
        }

        return [
            'major' => $major,
            'minor' => $minor,
            'alphaOrBeta' => $alphaOrBeta,
        ];
    }
}
