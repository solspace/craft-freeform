<?php

namespace Solspace\Freeform\Library\Helpers;

class FileHelper
{
    public static function isMimeTypeCheckEnabled(): bool
    {
        return \function_exists('mime_content_type');
    }

    /**
     * false - if mime check is disabled on the server
     * string - mime type of the filepath given.
     *
     * @return false|string
     */
    public static function getMimeType(string $filePath)
    {
        if (empty($filePath) || !self::isMimeTypeCheckEnabled()) {
            return false;
        }

        return mime_content_type($filePath);
    }

    public static function isAbsolute(string $path): bool
    {
        if (empty($path)) {
            throw new \InvalidArgumentException('Empty path');
        }

        $hasDirSeparator = \DIRECTORY_SEPARATOR === $path[0];
        $matchesDriveLetter = preg_match('~\A[A-Z]+:(?![^/\\\])~i', $path) > 0;

        return $hasDirSeparator || $matchesDriveLetter;
    }
}
