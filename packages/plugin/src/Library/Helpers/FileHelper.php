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
}
