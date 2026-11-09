<?php

namespace Solspace\Freeform\Library\Activity;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Twig\Error\LoaderError;
use Twig\Error\SyntaxError;
use yii\db\IntegrityException;

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
    public const INTEGRATION_TIMEOUT = 26;
    public const INTEGRATION_DNS = 27;
    public const INTEGRATION_TLS = 28;
    public const MAIL_TEMPLATE_SYNTAX = 30;
    public const MAIL_TEMPLATE_UNAVAILABLE = 31;
    public const MAIL_TRANSPORT_AUTH = 32;
    public const MAIL_CANCELLED = 33;
    public const SUBMISSION_CONSTRAINT = 34;
    public const INTEGRATION_NO_MAPPING = 40;
    public const INTEGRATION_NOT_CONFIGURED = 41;
    public const INTEGRATION_NO_LIST = 42;
    public const INTEGRATION_NO_OPT_IN = 43;
    public const INTEGRATION_NO_EMAIL = 44;
    public const AI_FAILED = 50;
    public const RULE_FAILED = 51;
    public const PAYMENT_FAILED = 52;
    public const FORWARDING_FAILED = 53;
    public const IMPORT_FAILED = 54;
    public const INTEGRATION_CREATED = 60;
    public const INTEGRATION_UPDATED = 61;
    public const INTEGRATION_LINKED = 62;
    public const INTEGRATION_SUBSCRIBED = 63;
    public const INTEGRATION_SAVED = 64;

    // Title, explanation, operation. All text comes from this catalog, never a payload.
    public const REASONS = [
        1 => ['Submission could not be saved', 'Freeform could not save the submission. Check the form storage settings and database connection. Validation details are excluded.', 'Submission storage'],
        2 => ['Submission storage interrupted', 'An exception interrupted submission storage. Review database availability and the form storage configuration.', 'Submission storage'],
        10 => ['Notification template missing', 'Freeform tried to send a notification, but its template was unavailable. Check the template assigned to that notification. Forms without email notifications do not need a template.', 'Notification configuration'],
        11 => ['No email recipients resolved', 'No usable recipients were resolved for this notification. Review its recipient mapping and conditions.', 'Recipient resolution'],
        12 => ['Notification rendering failed', 'Freeform could not build the email. Check the notification template and its variables. Template content and raw error text are excluded.', 'Notification rendering'],
        13 => ['Notification preparation failed', 'Notification preparation or a before-send handler failed. Review notification settings and custom event handlers.', 'Notification preparation'],
        14 => ['Mail transport rejected email', 'The mail transport did not accept the email. Review its credentials, connection settings, and sender configuration.', 'Mail transport'],
        15 => ['Mail transport interrupted', 'The mail transport stopped with an error. Check its connection and settings. Recipients and raw error text are excluded.', 'Mail transport'],
        16 => ['Notification post-processing failed', 'A handler failed after the transport outcome was recorded. Review the related handoff event and custom after-send handlers before retrying.', 'Notification post-processing'],
        20 => ['Integration authorization rejected', 'The service refused authorization. Review credentials and permissions, then reconnect if necessary.', 'Integration push'],
        21 => ['Integration rate limit reached', 'The service rate limit was reached. Check its limits and wait before attempting the operation again.', 'Integration push'],
        22 => ['Integration service error', 'The service returned a server error. Check its availability before attempting the operation again.', 'Integration push'],
        23 => ['Integration request rejected', 'The service rejected the request. Check the integration settings and field mapping. The response body is excluded.', 'Integration push'],
        24 => ['Integration connection failed', 'Freeform could not connect to the service. Check the network connection and integration settings. The destination URL and credentials are excluded.', 'Integration connection'],
        25 => ['Integration processing failed', 'The integration reported a failure. Review its connection, field mapping, and related processing events. The raw error text is excluded.', 'Integration push'],
        26 => ['Integration request timed out', 'The service did not respond before the timeout. Check its availability and the connection timeout settings before retrying.', 'Integration connection'],
        27 => ['Integration hostname could not be resolved', 'The server could not resolve the service hostname. Check DNS and the configured service address.', 'Integration connection'],
        28 => ['Integration secure connection failed', 'The TLS connection or certificate verification failed. Check server certificates and TLS configuration.', 'Integration connection'],
        30 => ['Notification template syntax error', 'The notification template contains invalid Twig syntax. Review the assigned template.', 'Notification rendering'],
        31 => ['Notification template could not be loaded', 'A template or included template was unavailable. Check its location and file permissions.', 'Notification rendering'],
        32 => ['Mail transport authorization failed', 'The mail server rejected authorization. Check the transport credentials and sender permissions.', 'Mail transport'],
        33 => ['Notification cancelled by a handler', 'A before-send event handler cancelled this notification. The mail transport was not called.', 'Notification preparation'],
        34 => ['Submission database constraint failed', 'A database constraint prevented submission storage. Check the database schema and field configuration.', 'Submission storage'],
        40 => ['Integration step has no mapping', 'No field mapping was available for this step. Other configured steps may still run.', 'Integration mapping'],
        41 => ['Email marketing configuration incomplete', 'The mailing list or email field was not configured. The subscription step was skipped.', 'Email marketing setup'],
        42 => ['Mailing list unavailable', 'No mailing list ID was available. Review the selected list and integration connection.', 'Email marketing setup'],
        43 => ['Email marketing opt-in not selected', 'The configured opt-in condition was not met. The subscription step was skipped.', 'Email marketing consent'],
        44 => ['Email marketing address unavailable', 'No email address was available for the subscription step. Review the email field mapping.', 'Email marketing mapping'],
        50 => ['AI operation failed', 'An AI operation reported a failure. Review the AI connection, model settings, and service availability.', 'AI processing'],
        51 => ['Conditional rule failed', 'A conditional rule could not be evaluated. Review its conditions and referenced fields.', 'Rule evaluation'],
        52 => ['Payment processing failed', 'A payment operation reported a failure. Review the gateway connection and related payment configuration.', 'Payment processing'],
        53 => ['Submission forwarding failed', 'The forwarding operation reported a failure. Review the destination configuration and service availability.', 'Submission forwarding'],
        54 => ['Import or migration failed', 'An import or migration operation reported a failure. Review the source configuration and supported data formats.', 'Import processing'],
        60 => ['Record creation reported', 'The integration reported creating a record. External record IDs and contents are excluded.', 'Integration action'],
        61 => ['Record update reported', 'The integration reported updating a record. External record IDs and contents are excluded.', 'Integration action'],
        62 => ['Record association reported', 'The integration reported linking related records. External record IDs and contents are excluded.', 'Integration action'],
        63 => ['Subscription action reported', 'The integration reported a subscription action. This does not confirm delivery of later marketing emails.', 'Integration action'],
        64 => ['Record save reported', 'The integration reported saving a record. External record IDs and contents are excluded.', 'Integration action'],
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

        if ($exception instanceof ConnectException) {
            $reason = match ($exception->getHandlerContext()['errno'] ?? null) {
                28 => self::INTEGRATION_TIMEOUT,
                5, 6 => self::INTEGRATION_DNS,
                35, 51, 58, 60, 77, 83, 90 => self::INTEGRATION_TLS,
                default => self::INTEGRATION_CONNECTION,
            };

            return ['reasonCode' => $reason];
        }

        return ['reasonCode' => self::INTEGRATION_FAILED];
    }

    public static function exceptionReason(\Throwable $exception, int $fallback): int
    {
        return match (true) {
            \in_array($fallback, [self::MAIL_RENDER_FAILED, self::MAIL_PREPARATION_FAILED], true) && $exception instanceof SyntaxError => self::MAIL_TEMPLATE_SYNTAX,
            \in_array($fallback, [self::MAIL_RENDER_FAILED, self::MAIL_PREPARATION_FAILED], true) && $exception instanceof LoaderError => self::MAIL_TEMPLATE_UNAVAILABLE,
            self::MAIL_SEND_EXCEPTION === $fallback && $exception instanceof TransportExceptionInterface
                && \in_array($exception->getCode(), [530, 534, 535, 538], true) => self::MAIL_TRANSPORT_AUTH,
            self::SUBMISSION_SAVE_EXCEPTION === $fallback && $exception instanceof IntegrityException => self::SUBMISSION_CONSTRAINT,
            default => $fallback,
        };
    }

    public static function diagnosticEvent(mixed $reason): ?string
    {
        if (\in_array($reason, [self::INTEGRATION_CREATED, self::INTEGRATION_UPDATED, self::INTEGRATION_LINKED, self::INTEGRATION_SUBSCRIBED, self::INTEGRATION_SAVED], true)) {
            return 'integration-action';
        }

        return \in_array($reason, [self::INTEGRATION_NO_MAPPING, self::INTEGRATION_NOT_CONFIGURED, self::INTEGRATION_NO_LIST, self::INTEGRATION_NO_OPT_IN, self::INTEGRATION_NO_EMAIL], true)
            ? 'integration-skipped' : null;
    }

    public static function loggerReason(string $category): ?int
    {
        $category = strtolower(str_replace('-', ' ', $category));

        return match ($category) {
            'ai' => self::AI_FAILED,
            'conditional rule' => self::RULE_FAILED,
            'payment gateway', 'stripe', 'paypal' => self::PAYMENT_FAILED,
            'post forwarding' => self::FORWARDING_FAILED,
            'migration' => self::IMPORT_FAILED,
            default => null,
        };
    }

    public static function elapsed(float $started): int
    {
        return max(1, min(86400000, (int) round((microtime(true) - $started) * 1000)));
    }
}
