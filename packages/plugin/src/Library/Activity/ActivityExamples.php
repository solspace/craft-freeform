<?php

namespace Solspace\Freeform\Library\Activity;

/** Fictional records using the exact same allowlist and presenter as the Activity feed. */
class ActivityExamples
{
    public static function all(): array
    {
        $facts = [
            'error' => ['reasonCode' => ActivityContext::SUBMISSION_SAVE_EXCEPTION, 'errorCount' => 1],
            'warning' => [],
            'submission' => [],
            'validation' => ['errorCount' => 2],
            'spam' => ['spamChecks' => 2 | 256],
            'email-error' => ['reasonCode' => ActivityContext::MAIL_TRANSPORT_AUTH, 'emailType' => 2, 'durationMs' => 184],
            'email-sent' => ['notificationId' => 7, 'siteId' => 1, 'durationMs' => 237],
            'email-skipped' => ['reasonCode' => ActivityContext::MAIL_CANCELLED, 'notificationId' => 7, 'durationMs' => 12],
            'integration-error' => ['integrationId' => 4, 'httpStatus' => 401, 'reasonCode' => ActivityContext::INTEGRATION_AUTH, 'attempt' => 1, 'operationId' => 123456, 'elapsedMs' => 312],
            'integration-response' => ['integrationId' => 4, 'httpStatus' => 200, 'attempt' => 1, 'operationId' => 123456, 'elapsedMs' => 246],
            'integration-started' => ['integrationId' => 4, 'attempt' => 1, 'operationId' => 123456],
            'integration-finished' => ['integrationId' => 4, 'attempt' => 1, 'operationId' => 123456, 'durationMs' => 346],
            'integration-skipped' => ['integrationId' => 4, 'attempt' => 1, 'operationId' => 123456, 'reasonCode' => ActivityContext::INTEGRATION_NO_MAPPING],
            'integration-action' => ['integrationId' => 4, 'attempt' => 1, 'operationId' => 123456, 'reasonCode' => ActivityContext::INTEGRATION_CREATED],
            'form-change' => ['fieldsUpdated' => 2, 'formSettingsChanged' => 1],
        ];
        // Fictional source details pass through the production sanitizer, including
        // the same message and argument-free stack shape that real failures use.
        $diagnostics = [
            'error' => [
                'exception' => \RuntimeException::class,
                'message' => 'Submission storage was interrupted by a connection failure.',
                'trace' => [['file' => 'SubmissionsService.php', 'function' => 'storeSubmission', 'line' => 376]],
            ],
            'warning' => [
                'message' => 'Integration connection check could not verify the configured API key.',
                'context' => ['service' => 'Example CRM', 'apiKey' => 'demo_test_7f8a9b0c1d2e3f4a5b6c7d8ea1b2c3d4'],
            ],
            'email-error' => [
                'exception' => 'Symfony\Component\Mailer\Exception\TransportException',
                'message' => 'SMTP authentication failed for demo@example.com at smtp://demo-user:demo-password@mail.example.com:587.',
                'trace' => [['file' => 'DigestService.php', 'function' => 'sendDigest', 'line' => 150]],
            ],
            'integration-error' => [
                'exception' => 'GuzzleHttp\Exception\RequestException',
                'message' => 'POST https://api.hubapi.com/crm/v3/objects/contacts returned HTTP 401',
                'trace' => [['file' => 'HubSpotV3.php', 'function' => 'push', 'line' => 301]],
            ],
        ];
        $examples = [];
        foreach ($facts as $event => $metadata) {
            if (isset($diagnostics[$event])) {
                $metadata['diagnostics'] = ActivityDiagnostics::clean($diagnostics[$event]);
            }
            $examples[$event] = ActivityPresentation::present([
                'event' => $event, 'formId' => \in_array($event, ['warning', 'email-error'], true) ? null : 12,
                'submissionId' => \in_array($event, ['error', 'warning', 'validation', 'form-change', 'email-error'], true) ? null : 1042,
                'metadata' => $metadata, 'dateCreated' => gmdate('Y-m-d H:i:s'),
            ], [12 => 'Contact'], [4 => 'HubSpot'], [7 => 'Admin alert']);
        }

        return $examples;
    }
}
