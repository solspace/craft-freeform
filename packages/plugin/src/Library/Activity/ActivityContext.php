<?php

namespace Solspace\Freeform\Library\Activity;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;

/** Stable, non-personal diagnostic codes. Never derive display text from exception messages. */
class ActivityContext
{
    public const SUBMISSION_SAVE_REJECTED = 1;
    public const SUBMISSION_SAVE_EXCEPTION = 2;
    public const MAIL_TEMPLATE_MISSING = 10;
    public const MAIL_NO_RECIPIENTS = 11;
    public const MAIL_RENDER_FAILED = 12;
    public const MAIL_PREPARATION_FAILED = 13;
    public const MAIL_REJECTED = 14;
    public const MAIL_SEND_EXCEPTION = 15;
    public const MAIL_AFTER_SEND_FAILED = 16;
    public const INTEGRATION_AUTH = 20;
    public const INTEGRATION_RATE_LIMIT = 21;
    public const INTEGRATION_REMOTE_ERROR = 22;
    public const INTEGRATION_REQUEST_REJECTED = 23;
    public const INTEGRATION_CONNECTION = 24;
    public const INTEGRATION_FAILED = 25;

    // Title, explanation, operation. All text comes from this catalog, never a payload.
    public const REASONS = [
        1 => ['Submission could not be saved', 'Freeform could not save the submission. Check the form storage settings and database connection. Validation details are excluded.', 'Submission storage'],
        2 => ['Submission storage interrupted', 'An exception interrupted submission storage. Review database availability and optional technical logging.', 'Submission storage'],
        10 => ['Notification template missing', 'Freeform tried to send a notification, but its template was unavailable. Check the template assigned to that notification. Forms without email notifications do not need a template.', 'Notification configuration'],
        11 => ['No email recipients resolved', 'No usable recipients were resolved for this notification. Review its recipient mapping and conditions.', 'Recipient resolution'],
        12 => ['Notification rendering failed', 'Freeform could not build the email. Check the notification template and its variables. Template content and raw error text are excluded.', 'Notification rendering'],
        13 => ['Notification preparation failed', 'Notification preparation or a before-send handler failed. Review notification settings and custom event handlers.', 'Notification preparation'],
        14 => ['Mail transport rejected notification', 'The mail transport did not accept the notification. Review mail transport settings and optional technical email logging.', 'Mail transport'],
        15 => ['Mail transport interrupted', 'The mail transport stopped with an error. Check its connection and settings. Recipients and raw error text are excluded.', 'Mail transport'],
        16 => ['Notification post-processing failed', 'A handler failed after the transport outcome was recorded. Review the related handoff event and custom after-send handlers before retrying.', 'Notification post-processing'],
        20 => ['Integration authorization rejected', 'The service refused authorization. Review credentials and permissions, then reconnect if necessary.', 'Integration push'],
        21 => ['Integration rate limit reached', 'The service rate limit was reached. Check its limits and wait before attempting the operation again.', 'Integration push'],
        22 => ['Integration service error', 'The service returned a server error. Check its availability before attempting the operation again.', 'Integration push'],
        23 => ['Integration request rejected', 'The service rejected the request. Check the integration settings and field mapping. The response body is excluded.', 'Integration push'],
        24 => ['Integration connection failed', 'Freeform could not connect to the service. Check the network connection and integration settings. The destination URL and credentials are excluded.', 'Integration connection'],
        25 => ['Integration processing failed', 'The integration reported a failure. Check its settings and technical logs if enabled. The raw error text is excluded.', 'Integration push'],
    ];

    public static function httpReason(int $status): ?int
    {
        return match (true) {
            401 === $status || 403 === $status => self::INTEGRATION_AUTH,
            429 === $status => self::INTEGRATION_RATE_LIMIT,
            $status >= 500 => self::INTEGRATION_REMOTE_ERROR,
            $status >= 400 => self::INTEGRATION_REQUEST_REJECTED,
            default => null,
        };
    }

    public static function integrationFailure(\Throwable $exception): array
    {
        if ($exception instanceof RequestException && $exception->getResponse()) {
            $status = $exception->getResponse()->getStatusCode();

            return ['httpStatus' => $status, 'reasonCode' => self::httpReason($status) ?? self::INTEGRATION_FAILED];
        }

        return ['reasonCode' => $exception instanceof ConnectException ? self::INTEGRATION_CONNECTION : self::INTEGRATION_FAILED];
    }

    public static function elapsed(float $started): int
    {
        return max(1, min(86400000, (int) round((microtime(true) - $started) * 1000)));
    }
}
