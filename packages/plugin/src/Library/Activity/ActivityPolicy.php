<?php

namespace Solspace\Freeform\Library\Activity;

/** The catalog is also the storage allowlist: never persist arbitrary log messages. */
class ActivityPolicy
{
    public const MODES = ['minimal', 'standard', 'detailed', 'custom'];

    public const CATEGORY_LABELS = ['system' => 'System', 'submissions' => 'Submissions', 'spam' => 'Spam', 'email' => 'Email', 'integrations' => 'Integrations', 'forms' => 'Forms'];
    public const LEVEL_LABELS = ['error' => 'Error', 'warning' => 'Warning', 'success' => 'Success', 'info' => 'Information'];

    public const EVENTS = [
        'error' => ['Errors', 'System error', 'Freeform reported an error. Activity does not store the original error text. Technical logs may have more detail if enabled.', 'error', 'system'],
        'warning' => ['Warnings', 'Operational warning', 'Freeform reported a warning. Activity does not store the original warning text. Technical logs may have more detail if enabled.', 'warning', 'system'],
        'submission' => ['Saved submissions', 'Submission saved', 'The submission was saved in Freeform.', 'success', 'submissions'],
        'validation' => ['Failed validation', 'Validation failed', 'A form submission attempt did not pass validation. Field values and validation messages are not recorded.', 'warning', 'submissions'],
        'spam' => ['Spam outcomes', 'Submission flagged as spam', 'Spam protection flagged this submission or submission attempt.', 'warning', 'spam'],
        'email-error' => ['Email failures', 'Notification failed', 'Notification processing reported a failure. Review any handoff events, the mail settings, and optional technical email log.', 'error', 'email'],
        'email-sent' => ['Email handoffs', 'Notification accepted by mail transport', 'The mail transport accepted the notification. Inbox delivery has not been confirmed.', 'success', 'email'],
        'integration-error' => ['Integration failures', 'Integration failed', 'An integration reported a failure. Check its connection settings. Technical logs may have more detail if enabled.', 'error', 'integrations'],
        'integration-response' => ['Integration responses', 'Integration responded', 'An integration returned a non-error HTTP response. A successful HTTP response does not necessarily confirm that the external action completed.', 'info', 'integrations'],
        'form-change' => ['Form saves', 'Form saved', 'The form settings were saved. Change counts are shown when available. Setting values and user details are excluded.', 'info', 'forms'],
    ];

    public const FORM_CHANGE_LABELS = [
        'fieldsAdded' => 'Fields added', 'fieldsUpdated' => 'Fields updated', 'fieldsRemoved' => 'Fields removed',
        'pagesAdded' => 'Pages added', 'pagesUpdated' => 'Pages updated', 'pagesRemoved' => 'Pages removed',
        'notificationsAdded' => 'Notifications added', 'notificationsUpdated' => 'Notifications updated', 'notificationsRemoved' => 'Notifications removed',
        'integrationsAdded' => 'Integrations added', 'integrationsUpdated' => 'Integrations updated', 'integrationsRemoved' => 'Integrations removed',
        'formSettingsChanged' => 'Form settings changed',
    ];

    public static function options(string $mode, array $custom = []): array
    {
        $standard = ['error', 'warning', 'submission', 'spam', 'email-error', 'integration-error'];
        $enabled = match ($mode) {
            'standard' => $standard,
            'detailed' => array_keys(self::EVENTS),
            'custom' => [] === $custom ? $standard : array_keys(array_filter($custom, static fn ($value) => \in_array($value, [true, 1, '1', 'true'], true))),
            default => ['error', 'email-error', 'integration-error'],
        };

        return array_replace(
            array_fill_keys(array_keys(self::EVENTS), false),
            array_fill_keys(array_intersect($enabled, array_keys(self::EVENTS)), true),
        );
    }

    public static function metadata(array $metadata): array
    {
        $clean = [];
        // Only numeric operational facts are accepted, even in Detailed mode.
        foreach (['httpStatus', 'notificationId', 'integrationId', 'siteId', 'errorCount', 'attempt', 'summaryIncomplete', 'reasonCode', 'spamChecks', 'durationMs', 'elapsedMs', ...array_keys(self::FORM_CHANGE_LABELS)] as $key) {
            $value = $metadata[$key] ?? null;
            if (\is_int($value) && $value > 0 && $value <= 2147483647) {
                $clean[$key] = $value;
            }
        }

        if (isset($clean['reasonCode']) && !isset(ActivityContext::REASONS[$clean['reasonCode']])) {
            unset($clean['reasonCode']);
        }

        if (isset($clean['spamChecks']) && ($clean['spamChecks'] & ~SpamChecks::ALL)) {
            unset($clean['spamChecks']);
        }

        return $clean;
    }
}
