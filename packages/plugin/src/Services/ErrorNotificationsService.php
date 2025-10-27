<?php

namespace Solspace\Freeform\Services;

use craft\console\Request as ConsoleRequest;
use craft\helpers\App;
use craft\helpers\Json;
use craft\web\Request as WebRequest;
use Monolog\LogRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

class ErrorNotificationsService extends BaseService
{
    private const CACHE_KEY_PREFIX = 'freeform:error-notification';
    private const CACHE_TTL_SECONDS = 3600; // 1-hour cooldown to avoid duplicate alerts
    private const TEMPLATE_PATH = __DIR__.'/../templates/_templates/email/error-report.twig';
    private const MAX_DEPTH = 6;

    public function handle(LogRecord $record): void
    {
        $recipients = $this->getSettingsService()->getErrorNotificationRecipients();
        if (!\count($recipients)) {
            return;
        }

        $cache = \Craft::$app->getCache();

        $exception = $this->extractException($record);
        $context = $this->normalizeContext($record->context, $exception);
        $extra = $this->normalizeContext($record->extra ?? []);

        $fingerprint = $this->buildFingerprint($record, $exception, $context);
        $cacheKey = \sprintf('%s:%s', self::CACHE_KEY_PREFIX, $fingerprint);

        if ($cache->get($cacheKey)) {
            // return;
        }

        $cache->set($cacheKey, true, self::CACHE_TTL_SECONDS);

        try {
            $notification = NotificationTemplate::fromFile(self::TEMPLATE_PATH, false);
        } catch (\Throwable) {
            return;
        }

        $mailerService = Freeform::getInstance()->mailer;

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->templateMode = \Craft::$app->view::TEMPLATE_MODE_CP;

        try {
            $variables = [
                'log' => [
                    'message' => $record->message,
                    'shortMessage' => $this->shorten($record->message),
                    'level' => $record->level->getName(),
                    'channel' => $record->channel,
                    'datetime' => $record->datetime,
                    'context' => $context,
                    'contextDump' => $this->contextToString($context),
                    'extra' => $extra,
                    'fingerprint' => $fingerprint,
                ],
                'exception' => $this->exceptionToArray($exception),
                'request' => $this->getRequestContext(),
                'site' => $this->getSiteContext(),
                'cooldownSeconds' => self::CACHE_TTL_SECONDS,
            ];

            $message = $mailerService->compileMessage($notification, $variables);
            $recipientList = $mailerService->processRecipients($recipients);

            if (!\count($recipientList)) {
                return;
            }

            $message->setTo($recipientList);
            \Craft::$app->getMailer()->send($message);
        } catch (\Throwable $exception) {
            // Swallow mailer issues to avoid recursive logging loops.
        }

        \Craft::$app->view->templateMode = $templateMode;
    }

    private function extractException(LogRecord $record): ?\Throwable
    {
        $context = $record->context;
        $exception = $context['exception'] ?? null;

        if ($exception instanceof \Throwable) {
            return $exception;
        }

        return null;
    }

    private function normalizeContext(array $context, ?\Throwable $exception = null, int $depth = 0): array
    {
        if ($depth > self::MAX_DEPTH) {
            return ['__truncated' => true];
        }

        unset($context['exception']);

        return array_map(
            fn ($value) => $this->normalizeValue($value, $depth + 1),
            $context,
        );
    }

    private function normalizeValue(mixed $value, int $depth = 0): mixed
    {
        if ($depth > self::MAX_DEPTH) {
            return '[depth truncated]';
        }

        if ($value instanceof \Throwable) {
            return $this->exceptionToArray($value);
        }

        if ($value instanceof \DateTimeInterface) {
            return $value->format(\DateTimeInterface::ATOM);
        }

        if (\is_array($value)) {
            $normalized = [];
            foreach ($value as $key => $item) {
                $normalized[$key] = $this->normalizeValue($item, $depth + 1);
            }

            return $normalized;
        }

        if ($value instanceof \Stringable) {
            return (string) $value;
        }

        if (\is_object($value)) {
            return method_exists($value, '__toString') ? (string) $value : $value::class;
        }

        if (\is_resource($value)) {
            return \sprintf('resource(%s)', get_resource_type($value) ?: 'unknown');
        }

        return $value;
    }

    private function exceptionToArray(?\Throwable $exception): ?array
    {
        if (!$exception) {
            return null;
        }

        return [
            'class' => $exception::class,
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => explode("\n", $exception->getTraceAsString()),
        ];
    }

    private function getRequestContext(): ?array
    {
        $request = \Craft::$app->getRequest();

        if ($request instanceof ConsoleRequest) {
            return [
                'type' => 'console',
                'command' => trim(implode(' ', $request->getParams())),
            ];
        }

        if (!$request instanceof WebRequest) {
            return null;
        }

        $user = \Craft::$app->getUser()->getIdentity();
        $contextUser = null;
        if ($user) {
            $identifier = $user->email ?? $user->username ?? 'User';
            $contextUser = \sprintf('%s (ID: %d)', $identifier, $user->id);
        }

        $context = [
            'type' => $request->getIsCpRequest() ? 'cp' : 'site',
            'method' => $request->getMethod(),
            'url' => null,
            'referrer' => null,
            'ip' => $request->getUserIP(),
            'user' => $contextUser,
            'userAgent' => $request->getUserAgent(),
        ];

        try {
            $context['url'] = $request->getAbsoluteUrl();
        } catch (\Throwable) {
        }

        try {
            $context['referrer'] = $request->getReferrer();
        } catch (\Throwable) {
        }

        return $context;
    }

    private function getSiteContext(): array
    {
        $site = \Craft::$app->getSites()->getCurrentSite();

        return [
            'name' => $site?->name,
            'handle' => $site?->handle,
            'baseUrl' => $site?->baseUrl,
            'environment' => App::env('CRAFT_ENVIRONMENT') ?? App::env('ENVIRONMENT') ?? 'production',
        ];
    }

    private function buildFingerprint(LogRecord $record, ?\Throwable $exception = null, array $context = []): string
    {
        $payload = [
            'channel' => $record->channel,
            'level' => $record->level->value,
            'message' => $record->message,
        ];

        if ($exception) {
            $payload['exception'] = [
                'class' => $exception::class,
                'code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ];
        } elseif (!empty($context)) {
            $payload['context'] = $this->filterContextForFingerprint($context);
        }

        try {
            $encoded = Json::encode($payload, \JSON_UNESCAPED_SLASHES);
        } catch (\Throwable) {
            $encoded = serialize($payload);
        }

        return sha1($encoded);
    }

    private function filterContextForFingerprint(array $context, int $depth = 0): array
    {
        if ($depth > 4) {
            return ['__truncated' => true];
        }

        $filtered = [];

        foreach ($context as $key => $value) {
            if (\in_array($key, ['datetime', 'timestamp', 'time', 'requestId'], true)) {
                continue;
            }

            if (\is_array($value)) {
                $filtered[$key] = $this->filterContextForFingerprint($value, $depth + 1);

                continue;
            }

            $filtered[$key] = $this->normalizeValue($value);
        }

        return $filtered;
    }

    private function shorten(string $message, int $limit = 120): string
    {
        $message = trim($message);

        $length = \function_exists('mb_strlen') ? mb_strlen($message) : \strlen($message);
        if ($length <= $limit) {
            return $message;
        }

        $slice = \function_exists('mb_substr') ? mb_substr($message, 0, $limit - 3) : substr($message, 0, $limit - 3);

        return rtrim($slice).'...';
    }

    private function contextToString(array $context): string
    {
        if (empty($context)) {
            return '';
        }

        try {
            return Json::encode($context, \JSON_PRETTY_PRINT | \JSON_UNESCAPED_SLASHES);
        } catch (\Throwable) {
            return print_r($context, true);
        }
    }
}
