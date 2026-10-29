<?php

namespace Solspace\Freeform\Library\Logging\Handlers;

use Monolog\Handler\AbstractHandler;
use Monolog\Logger;
use Monolog\LogRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityPolicy;

/** Bridges warnings/errors without ever copying arbitrary messages or context into Activity. */
class ActivityLogHandler extends AbstractHandler
{
    public function __construct(private string $source)
    {
        parent::__construct(Logger::WARNING);
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
                $event = $level >= Logger::ERROR
                ? match ($this->source) {
                    'integrations' => 'integration-error', 'email' => 'email-error', default => 'error'
                }
                : 'warning';
                $metadata = ActivityPolicy::metadata(['reasonCode' => $context['activityReason'] ?? null]);
                $formId = $context['activityFormId'] ?? null;
                $submissionId = $context['activitySubmissionId'] ?? null;
                Freeform::getInstance()->get('activity')->record($event, \is_int($formId) && $formId > 0 ? $formId : null, \is_int($submissionId) && $submissionId > 0 ? $submissionId : null, $metadata);
            }
        } catch (\Throwable) {
            // Compatible with both Monolog record formats; Activity must never interrupt file logging.
        }

        // No formatter: arbitrary messages, payloads and exception graphs are never serialized.
        return !$this->getBubble();
    }
}
