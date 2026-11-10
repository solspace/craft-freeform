<?php

namespace Solspace\Freeform\Library\Activity;

use Solspace\Freeform\Library\DataObjects\SpamReason;

/** Only check identities enter Activity. Never copy a reason message or rejected value. */
class SpamChecks
{
    public const CHECKS = [
        SpamReason::TYPE_GENERIC => [1, 'Other spam check'],
        SpamReason::TYPE_HONEYPOT => [2, 'Honeypot'],
        SpamReason::TYPE_JS_TEST => [4, 'JavaScript test'],
        SpamReason::TYPE_CAPTCHA => [8, 'CAPTCHA'],
        SpamReason::TYPE_BLOCKED_KEYWORDS => [16, 'Blocked keywords'],
        SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS => [32, 'Blocked email address'],
        SpamReason::TYPE_BLOCKED_IP => [64, 'Blocked IP address'],
        SpamReason::TYPE_GIBBERISH => [128, 'Gibberish detection'],
        SpamReason::TYPE_MINIMUM_SUBMIT_TIME => [256, 'Minimum submission time'],
        SpamReason::TYPE_MAXIMUM_SUBMIT_TIME => [512, 'Maximum submission time'],
        SpamReason::TYPE_AI => [1024, 'AI spam detection'],
    ];
    public const ALL = 2047;

    public static function metadata(array $reasons): array
    {
        $mask = 0;
        foreach (\array_slice($reasons, 0, 64) as $reason) {
            if (!\is_array($reason) || !\is_string($reason['type'] ?? null)) {
                continue;
            }
            $mask |= self::CHECKS[$reason['type']][0] ?? 1;
        }

        return $mask ? ['spamChecks' => $mask] : [];
    }

    public static function labels(int $mask): array
    {
        $labels = [];
        foreach (self::CHECKS as [$bit, $label]) {
            if ($mask & $bit) {
                $labels[] = $label;
            }
        }

        return $labels;
    }
}
