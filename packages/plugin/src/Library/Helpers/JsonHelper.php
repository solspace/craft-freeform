<?php

namespace Solspace\Freeform\Library\Helpers;

class JsonHelper
{
    public static function decode(mixed $json, bool $associative = false): mixed
    {
        if (\is_string($json)) {
            return json_decode($json, $associative);
        }

        if (!$associative && \is_array($json)) {
            return json_decode(json_encode($json));
        }

        return $json;
    }
}
