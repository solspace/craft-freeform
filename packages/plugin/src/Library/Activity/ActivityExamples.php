<?php

namespace Solspace\Freeform\Library\Activity;

/** Fictional records using the exact same allowlist and presenter as the Activity feed. */
class ActivityExamples
{
    public static function all(): array
    {
        $facts = [
            'error' => ['reasonCode' => ActivityContext::SUBMISSION_SAVE_REJECTED, 'errorCount' => 1],
            'warning' => ['reasonCode' => ActivityContext::MAIL_NO_RECIPIENTS],
            'submission' => [],
            'validation' => ['errorCount' => 2],
            'spam' => ['spamChecks' => 2 | 256],
            'email-error' => ['reasonCode' => ActivityContext::MAIL_REJECTED, 'notificationId' => 7, 'durationMs' => 184],
            'email-sent' => ['notificationId' => 7, 'siteId' => 1, 'durationMs' => 237],
            'integration-error' => ['integrationId' => 4, 'httpStatus' => 401, 'reasonCode' => ActivityContext::INTEGRATION_AUTH, 'attempt' => 1, 'elapsedMs' => 312],
            'integration-response' => ['integrationId' => 4, 'httpStatus' => 200, 'attempt' => 1, 'elapsedMs' => 246],
            'form-change' => ['fieldsUpdated' => 2, 'formSettingsChanged' => 1],
        ];
        $examples = [];
        foreach ($facts as $event => $metadata) {
            $examples[$event] = ActivityPresentation::present([
                'event' => $event, 'formId' => 12,
                'submissionId' => \in_array($event, ['error', 'warning', 'validation', 'form-change'], true) ? null : 1042,
                'metadata' => $metadata, 'dateCreated' => gmdate('Y-m-d H:i:s'),
            ], [12 => 'Contact'], [4 => 'HubSpot'], [7 => 'Admin alert']);
        }

        return $examples;
    }
}
