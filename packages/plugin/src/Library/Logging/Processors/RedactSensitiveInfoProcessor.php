<?php

namespace Solspace\Freeform\Library\Logging\Processors;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;
use Solspace\Freeform\Library\Logging\DiagnosticSanitizer;

class RedactSensitiveInfoProcessor implements ProcessorInterface
{
    public function __invoke(array|LogRecord $record): array|LogRecord
    {
        $sanitizer = new DiagnosticSanitizer();
        $context = $record instanceof LogRecord ? $record->context : ($record['context'] ?? []);
        $message = $record instanceof LogRecord ? $record->message : ($record['message'] ?? '');
        if (($context['exception'] ?? null) instanceof \Throwable) {
            $message = $sanitizer->exceptionMessage($context['exception']);
        }
        $message = $sanitizer->text($message);
        $context = $sanitizer->context($context);
        $extra = $sanitizer->context($record instanceof LogRecord ? $record->extra : ($record['extra'] ?? []));
        $fingerprints = DiagnosticSanitizer::cleanFingerprints($extra['fingerprints'] ?? []) + $sanitizer->fingerprints();
        unset($extra['fingerprints']);
        if ($fingerprints) {
            $extra['fingerprints'] = DiagnosticSanitizer::cleanFingerprints($fingerprints);
        }
        if ($record instanceof LogRecord) {
            return $record->with(
                message: $message,
                context: $context,
                extra: $extra,
            );
        }
        $record['message'] = $message;
        $record['context'] = $context;
        $record['extra'] = $extra;

        return $record;
    }
}
