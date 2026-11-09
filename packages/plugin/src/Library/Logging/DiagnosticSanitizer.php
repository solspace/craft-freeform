<?php

namespace Solspace\Freeform\Library\Logging;

use GuzzleHttp\Exception\RequestException;
use yii\db\Exception;

/** Best-effort masking, never a guarantee that arbitrary text is anonymous. */
class DiagnosticSanitizer
{
    public const REDACTED = '[redacted]';
    private int $remaining = 256;
    private int $textDepth = 0;
    private array $fingerprints = [];

    public function __construct(private ?string $fingerprintKey = null)
    {
        if (null === $this->fingerprintKey) {
            try {
                $this->fingerprintKey = \Craft::$app->getConfig()->getGeneral()->securityKey;
            } catch (\Throwable) {
                // No unkeyed hashes: omit fingerprints when the site key is unavailable.
            }
        }
    }

    public static function key(string $key): string
    {
        return strtolower(preg_replace('/[^a-z0-9]/i', '', $key));
    }

    public function context(mixed $value, int $depth = 0): mixed
    {
        if (0 === $depth) {
            $this->remaining = 256;
        }
        if (--$this->remaining < 0 || $depth > 5) {
            return '[details omitted]';
        }
        if ($value instanceof \Throwable) {
            return ['type' => $value::class, 'message' => $this->exceptionMessage($value), 'trace' => $this->trace([['file' => $value->getFile(), 'line' => $value->getLine()], ...$value->getTrace()])];
        }
        if ($value instanceof \stdClass) {
            $value = (array) $value;
        }
        if (\is_array($value)) {
            $result = [];
            foreach (\array_slice($value, 0, 32, true) as $key => $item) {
                $kind = self::key((string) $key);
                $result[\is_int($key) ? $key : $this->text((string) $key, 100)] = $this->value($kind, $item, $depth + 1);
            }

            return $result;
        }
        if (\is_string($value)) {
            return $this->text($value);
        }

        // Do not invoke __toString(), jsonSerialize(), or inspect arbitrary objects.
        if (\is_float($value) && !is_finite($value)) {
            return '[number omitted]';
        }

        return \is_scalar($value) || null === $value ? $value : '[object omitted]';
    }

    public function value(string $key, mixed $value, int $depth = 0): mixed
    {
        if (preg_match('/password|passwd|passphrase|secret|authorization|cookie|session|privatekey|csrf|signature/', $key) || \in_array($key, ['pass', 'pwd', 'auth', 'jwt'], true)) {
            return self::REDACTED;
        }
        if (preg_match('/apikey|accesstoken|refreshtoken|authtoken|clientid|credential/', $key) || \in_array($key, ['key', 'token'], true)) {
            return \is_string($value) ? $this->maskKey($value) : self::REDACTED;
        }
        if (preg_match('/^(?:request|response)?(?:body|payload|contents?)$|^(?:request|response|data|fields|fieldvalues|values|mapping|variables|html|bodyhtml|bodytext|textbody|messagebody|answers|post|files|attachments|emailbody|formdata|args|arguments)$/', $key)) {
            return '[content omitted]';
        }

        return $this->context($value, $depth);
    }

    public function text(string $value, int $limit = 2048): string
    {
        if ($this->textDepth >= 4) {
            return '[details omitted]';
        }
        ++$this->textDepth;

        try {
            return $this->sanitizeText($value, $limit);
        } finally {
            --$this->textDepth;
        }
    }

    public function exceptionMessage(\Throwable $exception): string
    {
        // Guzzle embeds response bodies in its message. Use only the transport summary.
        $message = $exception->getMessage();
        if ($exception instanceof RequestException) {
            $message = $exception->getRequest()->getMethod().' '.$exception->getRequest()->getUri();
            if ($exception->getResponse()) {
                $message .= ' returned HTTP '.$exception->getResponse()->getStatusCode();
            }
        }
        if ($exception instanceof \PDOException || $exception instanceof Exception) {
            return '[database details omitted]';
        }

        return $this->text($message);
    }

    /** Code locations only: no trace arguments, objects, or absolute paths. */
    public function trace(array $frames): array
    {
        $trace = [];
        foreach (\array_slice($frames, 0, 8) as $frame) {
            if (!\is_array($frame)) {
                continue;
            }
            $location = [];
            foreach (['class', 'function', 'file'] as $key) {
                if (!\is_string($frame[$key] ?? null)) {
                    continue;
                }
                if ('file' === $key) {
                    $location[$key] = $this->text(basename(str_replace('\\', '/', $frame[$key])), 160);
                } elseif ('function' === $key && str_starts_with($frame[$key], '{closure')) {
                    $location[$key] = '{closure}';
                } elseif (preg_match('/^[a-z0-9_\\\]{1,160}$/i', $frame[$key])) {
                    $location[$key] = $frame[$key];
                }
            }
            if (\is_int($frame['line'] ?? null) && $frame['line'] > 0) {
                $location['line'] = $frame['line'];
            }
            if ($location) {
                $trace[] = $location;
            }
        }

        return $trace;
    }

    /** Fingerprints accompany the record, never the human-readable value. */
    public function fingerprints(): array
    {
        return self::cleanFingerprints($this->fingerprints);
    }

    public static function cleanFingerprints(mixed $values): array
    {
        $clean = [];
        foreach (\array_slice(\is_array($values) ? $values : [], 0, 32, true) as $id => $masked) {
            if (!\is_string($id) || !\is_string($masked) || \strlen($masked) > 300) {
                continue;
            }
            if ((preg_match('/^email:[a-f0-9]{12}$/', $id) && preg_match('/^(?:[a-z0-9._%+\-])?\*{3}@[a-z0-9.\-]+$/i', $masked))
                || (preg_match('/^key:[a-f0-9]{12}$/', $id) && preg_match('/^(?:[a-z]{2,8}_(?:live|test)_)?\*{4}[a-z0-9_\-]{4}$/i', $masked))) {
                $clean[$id] = $masked;
            }
        }

        return $clean;
    }

    private function sanitizeText(string $value, int $limit): string
    {
        $value = mb_substr(mb_convert_encoding($value, 'UTF-8', 'UTF-8'), 0, 16384);
        $value = preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', '', $value);
        // Convert older inline annotations without changing their fingerprints.
        $protected = [];
        $value = preg_replace_callback('/\[masked (email|key): ((?:[a-z0-9._%+\-])?\*{3}@[a-z0-9.\-]+|(?:[a-z]{2,8}_(?:live|test)_)?\*{4}[a-z0-9_\-]{4})(?:; ref: ([a-f0-9]{12}))?\]/i', function ($match) use (&$protected) {
            if (isset($match[3])) {
                $this->fingerprints += self::cleanFingerprints([$match[1].':'.$match[3] => $match[2]]);
                $this->fingerprints = \array_slice($this->fingerprints, 0, 32, true);
            }
            $placeholder = "\x01".\count($protected)."\x02";
            $protected[$placeholder] = $match[2];

            return $placeholder;
        }, $value);
        $value = preg_replace('/-----BEGIN [^-]*PRIVATE KEY-----.*?(?:-----END [^-]*PRIVATE KEY-----|$)/s', self::REDACTED, $value);
        // Multi-line exception messages often append SQL, response bodies, or rendered templates.
        $value = preg_replace('/(?:\bSQL(?:STATE\[[^]]+\])?[^\r\n]*:|\b(?:SELECT|INSERT INTO|UPDATE\s+\w+\s+SET|DELETE FROM)\s).*/is', '[database details omitted]', $value);
        $value = preg_replace('/(?:\{|\[\s*\{|<(?:html|body|!doctype)\b).*/is', '[content omitted]', $value);
        $value = preg_replace('/\b(?:authorization|proxy-authorization|cookie|set-cookie)\s*:\s*[^\r\n]+/i', '[header redacted]', $value);
        $value = preg_replace('/\b(?:Bearer|Basic)\s+[a-z0-9+\/_.=\-]+/i', self::REDACTED, $value);
        $value = preg_replace_callback('~\b[a-z][a-z0-9+.\-]{1,15}://[^\s<>"\']+~i', function ($match) use (&$protected) {
            $placeholder = "\x01".\count($protected)."\x02";
            $protected[$placeholder] = $this->url($match[0]);

            return $placeholder;
        }, $value);
        $value = preg_replace('/(?<![a-z0-9_.\-])["\']?(?:[a-z0-9_.\-]{0,64}(?:password|passwd|passphrase|secret|authorization|cookie|session|private[_-]?key)|pass|pwd)["\']?\s*[:=]\s*[^\r\n]*/i', '[secret redacted]', $value);
        $value = preg_replace_callback('/(?<![a-z0-9_.\-])(["\']?(?:[a-z0-9_.\-]{0,64}(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|cookie|session|signature|client[_-]?id)|pass|pwd|token)["\']?\s*[:=]\s*)(?:"([^"\r\n]*)"|\'([^\'\r\n]*)\'|([^\s,;&]+))/i', function ($match) use (&$protected) {
            $key = self::key(preg_replace('/[:=].*$/s', '', $match[1]));
            $raw = $match[2] ?? '';
            $raw = '' !== $raw ? $raw : (($match[3] ?? '') ?: ($match[4] ?? ''));

            return $match[1].(isset($protected[$raw]) ? $raw : $this->value($key, $raw));
        }, $value);
        $value = preg_replace_callback('/(?:"[^"\r\n]+"|(?<![a-z0-9._%+\-*])[a-z0-9._%+\-]{1,64})@[a-z0-9](?:[a-z0-9.\-]*[a-z0-9])?/i', fn ($match) => $this->maskEmail($match[0]), $value);
        $value = preg_replace_callback('/\b(?:[a-z]{2,8}_(?:live|test)_[a-z0-9_\-]{8,}|gh[pousr]_[a-z0-9]{12,}|github_pat_[a-z0-9_]{12,}|AKIA[A-Z0-9]{16}|eyJ[a-z0-9_\-]+\.[a-z0-9_\-]+\.[a-z0-9_\-]+)\b/i', fn ($match) => str_starts_with($match[0], 'eyJ') ? self::REDACTED : $this->maskKey($match[0]), $value);
        $value = preg_replace_callback('/\b(?:[a-f0-9]{32,}|[a-z0-9_\-]{40,})\b/i', fn ($match) => $this->maskKey($match[0]), $value);
        $value = preg_replace('/(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])|(?<![\w:])(?:[a-f0-9]{0,4}:){2,}[a-f0-9:]{0,4}(?![\w:])/i', '[IP omitted]', $value);
        $value = preg_replace_callback('~(?:[a-z]:[\\\/]|/(?:Users|home|var|private|srv|app|www|opt|tmp)/)[^\s<>"\']+~i', static fn ($match) => '[path]/'.basename(str_replace('\\', '/', $match[0])), $value);
        $value = strtr($value, $protected);

        return mb_strlen($value) > $limit ? mb_substr($value, 0, $limit).'…' : $value;
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2);

        $masked = (\strlen($local) > 1 && preg_match('/^[a-z0-9._%+\-]/i', trim($local, '"')) ? trim($local, '"')[0] : '').'***@'.strtolower($domain);
        $this->remember('email', $masked, strtolower($email));

        return $masked;
    }

    private function maskKey(string $key): string
    {
        if (preg_match('/^\[masked key: ((?:[a-z]{2,8}_(?:live|test)_)?\*{4}[a-z0-9_\-]{4})(?:; ref: ([a-f0-9]{12}))?\]$/i', $key, $legacy)) {
            if (isset($legacy[2])) {
                $this->fingerprints += self::cleanFingerprints(['key:'.$legacy[2] => $legacy[1]]);
            }

            return $legacy[1];
        }
        if (preg_match('/^(?:[a-z]{2,8}_(?:live|test)_)?\*{4}[a-z0-9_\-]{4}$/i', $key)) {
            return $key;
        }
        if (\strlen($key) < 16 || !preg_match('/^[a-z0-9_\-]+$/i', $key)) {
            return self::REDACTED;
        }
        preg_match('/^[a-z]{2,8}_(?:live|test)_/i', $key, $prefix);
        $masked = ($prefix[0] ?? '').'****'.substr($key, -4);
        $this->remember('key', $masked, $key);

        return $masked;
    }

    private function remember(string $type, string $masked, string $value): void
    {
        if ($this->fingerprintKey && \count($this->fingerprints) < 32) {
            $id = $type.':'.substr(hash_hmac('sha256', 'freeform-diagnostic:'.$value, $this->fingerprintKey), 0, 12);
            $this->fingerprints[$id] = $masked;
        }
    }

    private function url(string $url): string
    {
        $parts = parse_url(rtrim($url, '.,;)'));
        if (!$parts || empty($parts['host'])) {
            return '[URL omitted]';
        }
        $path = $this->text(rawurldecode($parts['path'] ?? ''));
        $path = preg_replace_callback('/[a-z0-9_\-]{24,}/i', fn ($match) => $this->maskKey($match[0]), $path);
        $query = [];
        foreach (\array_slice(explode('&', $parts['query'] ?? ''), 0, 20) as $parameter) {
            if ('' === $parameter) {
                continue;
            }
            [$key, $value] = array_pad(explode('=', $parameter, 2), 2, '');
            $key = rawurldecode($key);
            $value = rawurldecode($value);
            $kind = self::key($key);
            $safe = preg_match('/^(?:page|limit|offset|status|code|version)$/', $kind) && ctype_digit($value) ? $value : self::REDACTED;
            if (preg_match('/apikey|token|email|recipient|password|secret|auth|cookie/', $kind)) {
                $safe = $this->value($kind, $value);
            }
            $query[] = rawurlencode($this->text($key, 80)).'='.rawurlencode((string) $safe);
        }

        $host = filter_var(trim($parts['host'], '[]'), \FILTER_VALIDATE_IP) ? '[IP-omitted]' : $parts['host'];

        return $parts['scheme'].'://'.(isset($parts['user']) ? '*********@' : '').$host.(isset($parts['port']) ? ':'.$parts['port'] : '').$path.($query ? '?'.implode('&', $query) : '');
    }
}
