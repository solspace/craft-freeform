<?php

namespace Solspace\Freeform\Library\Logging\Handlers;

use Monolog\Handler\AbstractHandler;
use Monolog\Logger;
use Monolog\LogRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\ActivityDiagnostics;
use Solspace\Freeform\Library\Activity\ActivityPolicy;

/** Bridges failures through the bounded sanitizer and explicitly typed diagnostics. */
class ActivityLogHandler extends AbstractHandler
{
    public function __construct(private string $source, private string $category = '')
    {
        parent::__construct(Logger::DEBUG);
    }

    public function isHandling($record): bool
    {
        $level = $record instanceof LogRecord ? $record->level->value : $record['level'];
        // Monolog 2 probes with only the level before building the full record.
        // Accept that probe so handle() can inspect typed integration markers.
        if (\is_array($record) && !\array_key_exists('context', $record)) {
            return $level >= Logger::DEBUG;
        }
        $context = $record instanceof LogRecord ? $record->context : ($record['context'] ?? []);

        return $level >= Logger::WARNING || null !== ActivityContext::diagnosticEvent($context['activityReason'] ?? null);
    }

    public function handle($record): bool
    {
        if (!$this->isHandling($record)) {
            return false;
        }

        try {
            $context = $record instanceof LogRecord ? $record->context : ($record['context'] ?? []);
            $level = $record instanceof LogRecord ? $record->level->value : $record['level'];
            if (empty($context['activityRecorded'])) {
                $reason = $context['activityReason'] ?? null;
                if ($level < Logger::WARNING) {
                    if (ActivityContext::diagnosticEvent($reason)) {
                        Freeform::getInstance()->get('activity')->recordIntegrationDiagnostic($reason);
                    }

                    return false;
                }
                $event = $level >= Logger::ERROR
                ? match ($this->source) {
                    'integrations' => 'integration-error', 'email' => 'email-error', default => 'error'
                }
                : 'warning';
                if ('email' === $this->source && \in_array($reason, [ActivityContext::MAIL_TEMPLATE_MISSING, ActivityContext::MAIL_NO_RECIPIENTS], true)) {
                    $event = 'email-error';
                }
                $extra = $record instanceof LogRecord ? $record->extra : ($record['extra'] ?? []);
                $metadata = ActivityPolicy::metadata([
                    'reasonCode' => $reason ?? ($level >= Logger::ERROR ? ActivityContext::loggerReason($this->category) : null),
                    'notificationId' => $context['activityNotificationId'] ?? null,
                    'diagnostics' => ActivityDiagnostics::fromLog($record instanceof LogRecord ? $record->message : ($record['message'] ?? ''), $context, \is_array($extra['fingerprints'] ?? null) ? $extra['fingerprints'] : []),
                ]);
                $formId = $context['activityFormId'] ?? null;
                $submissionId = $context['activitySubmissionId'] ?? null;
                Freeform::getInstance()->get('activity')->record($event, \is_int($formId) && $formId > 0 ? $formId : null, \is_int($submissionId) && $submissionId > 0 ? $submissionId : null, $metadata, notifyErrors: false);
            }
        } catch (\Throwable) {
            // Compatible with both Monolog record formats; Activity must never interrupt file logging.
        }

        // Payloads and exception graphs are never serialized by the Activity bridge.
        return !$this->getBubble();
    }
}
