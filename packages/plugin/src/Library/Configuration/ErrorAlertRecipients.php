<?php

namespace Solspace\Freeform\Library\Configuration;

use craft\helpers\App;
use Solspace\Freeform\Library\Helpers\StringHelper;

class ErrorAlertRecipients
{
    /** Keep configuration references intact when merging the retired recipient list. */
    public static function merge(?string ...$lists): string
    {
        $recipients = [];
        foreach ($lists as $list) {
            foreach (StringHelper::extractSeparatedValues($list ?? '') as $recipient) {
                $key = filter_var($recipient, \FILTER_VALIDATE_EMAIL) ? strtolower($recipient) : $recipient;
                $recipients[$key] ??= $recipient;
            }
        }

        return implode(', ', $recipients);
    }

    /** Resolve each reference separately: an environment variable may contain a list. */
    public static function resolve(?string $list): array
    {
        $resolved = [];
        foreach (StringHelper::extractSeparatedValues($list ?? '') as $recipient) {
            $resolved[] = App::parseEnv($recipient) ?? '';
        }

        return StringHelper::extractSeparatedValues(self::merge(...$resolved));
    }
}
