<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\helpers\App;

class BooleanHelper
{
    public static function normalize(mixed $value): bool
    {
        if (null === $value) {
            return false; // Default
        }

        if (\is_bool($value)) {
            return $value;
        }

        // Handle historical int storage (0/1)
        if (\is_int($value)) {
            return (bool) $value;
        }

        // Handle env-style strings: 'true', 'false', '1', '0', 'yes', 'no', etc.
        if (\is_string($value)) {
            return App::parseBooleanEnv($value) ?? false;
        }

        // Fallback for anything unexpected
        return false;
    }
}
