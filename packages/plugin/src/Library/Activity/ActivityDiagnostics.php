<?php

namespace Solspace\Freeform\Library\Activity;

use Solspace\Freeform\Library\Logging\DiagnosticSanitizer;

/** Small diagnostic envelope; arbitrary log context and object graphs are never stored. */
class ActivityDiagnostics
{
    public const MAX_BYTES = 8192;
    private const CONTEXT_KEYS = ['email', 'recipient', 'apikey', 'accesstoken', 'clientid', 'endpoint', 'url', 'method', 'code', 'status', 'host', 'port', 'service', 'operation'];

    public static function fromException(\Throwable $exception, array $context = []): array
    {
        $sanitizer = new DiagnosticSanitizer();
        $trace = [['file' => $exception->getFile(), 'line' => $exception->getLine()]];
        foreach (\array_slice($exception->getTrace(), 0, 8) as $frame) {
            $trace[] = array_intersect_key($frame, array_flip(['class', 'function', 'file', 'line']));
        }

        $message = $sanitizer->exceptionMessage($exception);

        return self::clean(['message' => $message, 'exception' => $exception::class, 'context' => $context, 'trace' => $trace, 'fingerprints' => $sanitizer->fingerprints()]);
    }

    public static function fromLog(string $message, array $context, array $fingerprints = []): array
    {
        if (($context['exception'] ?? null) instanceof \Throwable) {
            $data = self::fromException($context['exception'], $context);
        } elseif (\is_array($context['exception'] ?? null)) {
            $data = ['message' => $context['exception']['message'] ?? '', 'exception' => $context['exception']['type'] ?? '', 'context' => $context, 'trace' => $context['exception']['trace'] ?? []];
        } else {
            $data = ['message' => $message, 'context' => $context];
        }
        $data['fingerprints'] = DiagnosticSanitizer::cleanFingerprints($fingerprints) + ($data['fingerprints'] ?? []);

        return self::clean($data);
    }

    public static function clean(mixed $data): array
    {
        if (!\is_array($data)) {
            return [];
        }
        $sanitizer = new DiagnosticSanitizer();
        $clean = [];
        if (\is_string($data['message'] ?? null)) {
            $clean['message'] = $sanitizer->text($data['message']);
        }
        if (\is_string($data['exception'] ?? null) && preg_match('/^[a-z0-9_\\\]{1,200}$/i', $data['exception'])) {
            $clean['exception'] = $data['exception'];
        }
        if (\is_array($data['context'] ?? null)) {
            foreach (\array_slice($data['context'], 0, 32, true) as $key => $value) {
                if (\in_array(DiagnosticSanitizer::key((string) $key), self::CONTEXT_KEYS, true) && (\is_scalar($value) || null === $value)) {
                    $clean['context'][$key] = $sanitizer->value(DiagnosticSanitizer::key((string) $key), $value);
                }
            }
        }
        $clean['trace'] = $sanitizer->trace(\is_array($data['trace'] ?? null) ? $data['trace'] : []);
        $clean['fingerprints'] = DiagnosticSanitizer::cleanFingerprints(DiagnosticSanitizer::cleanFingerprints($data['fingerprints'] ?? []) + $sanitizer->fingerprints());
        // Encoded byte limit also covers escaped Unicode and JSON overhead.
        while (\strlen(json_encode($clean, \JSON_INVALID_UTF8_SUBSTITUTE)) > self::MAX_BYTES) {
            if (!empty($clean['trace'])) {
                array_pop($clean['trace']);
            } elseif (!empty($clean['context'])) {
                array_pop($clean['context']);
            } elseif (!empty($clean['fingerprints'])) {
                array_pop($clean['fingerprints']);
            } else {
                $clean['message'] = mb_substr($clean['message'] ?? '', 0, (int) (mb_strlen($clean['message'] ?? '') / 2));
            }
        }

        return array_filter($clean, static fn ($value) => [] !== $value && '' !== $value);
    }
}
