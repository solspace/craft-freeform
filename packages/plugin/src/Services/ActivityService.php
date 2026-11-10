<?php

namespace Solspace\Freeform\Services;

use craft\db\Connection;
use craft\db\Query;
use craft\helpers\Db;
use craft\helpers\StringHelper;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\ActivityDiagnostics;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Models\Settings;

class ActivityService extends BaseService
{
    private const MAX_EVENTS_PER_REQUEST = 100;

    private int $written = 0;
    private bool $unavailable = false;
    private array $integrationContext = [];
    private ?\WeakMap $reportedIntegrationFailures = null;
    private ?\WeakMap $reportedEmailFailures = null;
    private array $pending = [];
    private bool $cleanupBudgetExhausted = false;

    /** Logging is deliberately best-effort and may never break the operation being observed. */
    public function record(string $event, ?int $formId = null, ?int $submissionId = null, array $metadata = [], bool $notifyErrors = true): void
    {
        // Critical alerts are independent of recording style, selected categories, and storage failures.
        if ($notifyErrors && 'error' === (ActivityPolicy::EVENTS[$event][3] ?? null)) {
            try {
                if ($this->getSettingsService()->isErrorNotificationEnabled()) {
                    Freeform::getInstance()->errorNotifications->handleActivity($event, $formId ?? $this->integrationContext['formId'] ?? null, $submissionId ?? $this->integrationContext['submissionId'] ?? null, $metadata + array_intersect_key($this->integrationContext, array_flip(['integrationId', 'attempt', 'operationId'])));
                }
            } catch (\Throwable) {
                // Alert delivery must not change recording or the operation being observed.
            }
        }

        try {
            if ($this->unavailable || $this->written >= self::MAX_EVENTS_PER_REQUEST || !isset(ActivityPolicy::EVENTS[$event])) {
                return;
            }

            $settings = $this->getSettingsService()->getSettingsModel();
            if (!$settings->isActivityLoggingEnabled() || !ActivityPolicy::options($settings->activityMode, $settings->activityEvents)[$event]) {
                return;
            }

            $formId ??= $this->integrationContext['formId'] ?? null;
            $submissionId ??= $this->integrationContext['submissionId'] ?? null;
            $metadata = array_filter($metadata, static fn ($value) => null !== $value)
                + array_intersect_key($this->integrationContext, array_flip(['integrationId', 'attempt', 'operationId']));

            $definition = ActivityPolicy::EVENTS[$event];
            if (!\in_array($definition[3], ['error', 'warning'], true)) {
                unset($metadata['diagnostics']);
            }
            $now = Db::prepareDateForDb(new \DateTimeImmutable('now', new \DateTimeZone('UTC')));
            $row = [
                'event' => $event,
                'category' => $definition[4],
                'level' => $definition[3],
                'formId' => $formId > 0 ? $formId : null,
                'submissionId' => $submissionId > 0 ? $submissionId : null,
                'metadata' => json_encode(ActivityPolicy::metadata($metadata), \JSON_THROW_ON_ERROR),
                'dateCreated' => $now,
                'dateUpdated' => $now,
                'uid' => StringHelper::UUID(),
            ];
            if ($this->inTransaction()) {
                // Keep transaction-scoped events in that transaction so rolled-back saves do
                // not become phantom successes when the deferred request buffer is flushed.
                $this->write([$row]);
            } else {
                $this->pending[] = $row;
            }
            ++$this->written;
        } catch (\Throwable) {
            // No recursive logging, payload fallback, retries, or repeated writes to a missing table.
            $this->unavailable = true;
        }
    }

    public function isEnabled(string $event): bool
    {
        try {
            $settings = $this->getSettingsService()->getSettingsModel();

            return $settings->isActivityLoggingEnabled() && (ActivityPolicy::options($settings->activityMode, $settings->activityEvents)[$event] ?? false);
        } catch (\Throwable) {
            return false;
        }
    }

    public function recordForForm(string $event, Form $form, array $metadata = []): void
    {
        try {
            $this->record($event, $form->getId(), $form->getSubmission()?->id, $metadata);
        } catch (\Throwable) {
            // Form loading/teardown must not be affected by Activity either.
        }
    }

    /** Used by queue workers before each job so the cap and circuit breaker are per job. */
    public function reset(): void
    {
        $this->flush();
        $this->written = 0;
        $this->unavailable = false;
        $this->integrationContext = [];
        $this->reportedIntegrationFailures = null;
        $this->reportedEmailFailures = null;
    }

    /** One bounded database write at the end of a web request or queue job. */
    public function flush(): void
    {
        $rows = $this->pending;
        $this->pending = [];
        if (!$rows || $this->unavailable) {
            return;
        }

        try {
            $this->write($rows);
        } catch (\Throwable) {
            $this->unavailable = true;
        }
    }

    /** Maintain submission context across synchronous and queued integration requests. */
    public function observeIntegration(Form $form, callable $operation, ?int $integrationId = null, int $attempt = 1): mixed
    {
        $previous = $this->integrationContext;
        $started = microtime(true);

        try {
            $this->integrationContext = ['formId' => $form->getId(), 'submissionId' => $form->getSubmission()?->id, 'started' => $started, 'attempt' => $attempt, 'integrationId' => $integrationId, 'operationId' => random_int(1, 2147483647)];
        } catch (\Throwable) {
            $this->integrationContext = [];
        }

        try {
            $this->recordForForm('integration-started', $form);
            $result = $operation();
            $this->recordForForm('integration-finished', $form, ['durationMs' => ActivityContext::elapsed($started)]);

            return $result;
        } catch (\Throwable $exception) {
            try {
                $alreadyReported = $exception instanceof RequestException && $exception->getResponse()
                    && ($this->integrationContext['failedStatus'] ?? null) === $exception->getResponse()->getStatusCode();
                if (!$alreadyReported && !$this->hasRecordedIntegrationFailure($exception)) {
                    $this->recordForForm('integration-error', $form, ActivityContext::integrationFailure($exception) + [
                        'integrationId' => $integrationId, 'attempt' => $attempt, 'durationMs' => ActivityContext::elapsed($started),
                        'diagnostics' => ActivityDiagnostics::fromException($exception),
                    ]);
                }
                $this->reportedIntegrationFailures ??= new \WeakMap();
                $this->reportedIntegrationFailures[$exception] = true;
            } catch (\Throwable) {
                // Preserve the original operation failure if diagnostics are unavailable.
            }

            throw $exception;
        } finally {
            $this->integrationContext = $previous;
        }
    }

    public function hasRecordedIntegrationFailure(\Throwable $exception): bool
    {
        return isset($this->reportedIntegrationFailures[$exception]);
    }

    /** Typed integration markers are meaningful only while processing a submitted form. */
    public function recordIntegrationDiagnostic(int $reason): void
    {
        if (!empty($this->integrationContext['formId']) && empty($this->integrationContext['diagnostics'][$reason]) && ($event = ActivityContext::diagnosticEvent($reason))) {
            $this->integrationContext['diagnostics'][$reason] = true;
            $this->record($event, metadata: ['reasonCode' => $reason]);
        }
    }

    /** Capture scheduled email outcomes without retaining message content or recipients. */
    public function observeEmail(callable $operation, int $emailType): mixed
    {
        $started = microtime(true);

        try {
            $sent = $operation();
        } catch (\Throwable $exception) {
            $this->record('email-error', metadata: ['emailType' => $emailType, 'reasonCode' => ActivityContext::exceptionReason($exception, ActivityContext::MAIL_SEND_EXCEPTION), 'durationMs' => ActivityContext::elapsed($started), 'diagnostics' => ActivityDiagnostics::fromException($exception)]);
            $this->reportedEmailFailures ??= new \WeakMap();
            $this->reportedEmailFailures[$exception] = true;

            throw $exception;
        }
        $this->record($sent ? 'email-sent' : 'email-error', metadata: ['emailType' => $emailType, 'reasonCode' => $sent ? null : ActivityContext::MAIL_REJECTED, 'durationMs' => ActivityContext::elapsed($started)]);

        return $sent;
    }

    public function hasRecordedEmailFailure(\Throwable $exception): bool
    {
        return isset($this->reportedEmailFailures[$exception]);
    }

    public function recordIntegrationResponse(int $status, ?int $integrationId): void
    {
        if (empty($this->integrationContext['formId'])) {
            return;
        }
        $metadata = ['httpStatus' => $status, 'integrationId' => $integrationId, 'attempt' => $this->integrationContext['attempt'] ?? 1];
        if (isset($this->integrationContext['started'])) {
            $metadata['elapsedMs'] = ActivityContext::elapsed($this->integrationContext['started']);
        }
        if ($status >= 400) {
            $metadata['reasonCode'] = ActivityContext::httpReason($status);
            $this->integrationContext['failedStatus'] = $status;
        }
        $this->record($status >= 400 ? 'integration-error' : 'integration-response', $this->integrationContext['formId'], $this->integrationContext['submissionId'] ?? null, $metadata);
    }

    public function clearBatch(int $throughId): int
    {
        $ids = (new Query())->select('id')->from(ActivityTable::TABLE)->where(['<=', 'id', $throughId])->orderBy(['id' => \SORT_ASC])->limit(500)->column();

        return $ids ? \Craft::$app->getDb()->createCommand()->delete(ActivityTable::TABLE, ['id' => $ids])->execute() : 0;
    }

    public function getErrorCount(): int
    {
        try {
            $settings = $this->getSettingsService()->getSettingsModel();

            return (int) \Craft::$app->getCache()->getOrSet(['freeform-activity-errors', $settings->activityRetentionDays], static fn () => (new Query())->from(ActivityTable::TABLE)
                ->where(['level' => 'error', 'resolvedAt' => null])->andWhere(['>=', 'dateCreated', self::cutoff($settings)])->count(), 60);
        } catch (\Throwable) {
            return 0;
        }
    }

    public function invalidateErrorCount(): void
    {
        try {
            $days = $this->getSettingsService()->getSettingsModel()->activityRetentionDays;
            \Craft::$app->getCache()->delete(['freeform-activity-errors', $days]);
            \Craft::$app->getCache()->delete(['freeform-activity-operational-warnings', $days]);
        } catch (\Throwable) {
            // A stale badge must never interrupt cleanup.
        }
    }

    public function getOperationalWarningCount(): int
    {
        try {
            $settings = $this->getSettingsService()->getSettingsModel();

            return (int) \Craft::$app->getCache()->getOrSet(['freeform-activity-operational-warnings', $settings->activityRetentionDays], static fn () => (new Query())->from(ActivityTable::TABLE)
                ->where(['level' => 'warning', 'category' => 'system', 'resolvedAt' => null])->andWhere(['>=', 'dateCreated', self::cutoff($settings)])->count(), 60);
        } catch (\Throwable) {
            return 0;
        }
    }

    /** Latest retained errors and operational warnings inside a digest's UTC interval. */
    public function getOperationalEvents(\DateTimeInterface $start, \DateTimeInterface $end, int $limit = 5): array
    {
        try {
            $settings = $this->getSettingsService()->getSettingsModel();
            $utc = new \DateTimeZone('UTC');

            return (new Query())->from(ActivityTable::TABLE)
                ->where(['or', ['level' => 'error'], ['level' => 'warning', 'category' => 'system']])
                ->andWhere(['resolvedAt' => null])
                ->andWhere(['>=', 'dateCreated', self::cutoff($settings)])
                ->andWhere(['>=', 'dateCreated', \DateTimeImmutable::createFromInterface($start)->setTimezone($utc)->format('Y-m-d H:i:s')])
                ->andWhere(['<=', 'dateCreated', \DateTimeImmutable::createFromInterface($end)->setTimezone($utc)->format('Y-m-d H:i:s')])
                ->orderBy(['dateCreated' => \SORT_DESC, 'id' => \SORT_DESC])->limit(max(1, min(50, $limit)))->all()
            ;
        } catch (\Throwable) {
            return [];
        }
    }

    /** Resolve only the observed events, so new failures in the same submission stay open. */
    public function setResolved(int $eventId, int $throughId, bool $resolved, bool $submission = false): int
    {
        if ($eventId < 1 || $throughId < $eventId) {
            throw new \InvalidArgumentException('Invalid activity resolution target.');
        }
        $row = (new Query())->from(ActivityTable::TABLE)->where(['id' => $eventId])->one();
        if (!$row) {
            return 0;
        }
        $condition = ['and',
            ['or', ['level' => 'error'], ['level' => 'warning', 'category' => 'system']],
            ['<=', 'id', $throughId],
            ['>=', 'dateCreated', self::cutoff($this->getSettingsService()->getSettingsModel())],
            $submission && $row['submissionId'] ? ['formId' => $row['formId'], 'submissionId' => $row['submissionId']] : ['id' => $eventId],
            $resolved ? ['resolvedAt' => null] : ['not', ['resolvedAt' => null]],
        ];
        $count = \Craft::$app->getDb()->createCommand()->update(ActivityTable::TABLE, ['resolvedAt' => $resolved ? gmdate('Y-m-d H:i:s') : null], $condition)->execute();
        $this->invalidateErrorCount();

        return $count;
    }

    /** Bounded cleanup; expired records are also excluded from reads while cleanup catches up. */
    public function purge(int $batches = 20): int
    {
        $this->cleanupBudgetExhausted = false;
        $settings = $this->getSettingsService()->getSettingsModel();
        $cutoff = self::cutoff($settings);
        $budget = min(100, max(1, $batches));
        $deleted = 0;
        // Separate indexed ranges: an OR with ORDER BY id can scan the full table on every batch.
        while ($budget > 0) {
            $ids = (new Query())->select('id')->from(ActivityTable::TABLE)->where(['<', 'dateCreated', $cutoff])->orderBy(['dateCreated' => \SORT_ASC, 'id' => \SORT_ASC])->limit(500)->column();
            if (!$ids) {
                break;
            }
            --$budget;
            $deleted += \Craft::$app->getDb()->createCommand()->delete(ActivityTable::TABLE, ['id' => $ids])->execute();
        }
        if ($budget > 0) {
            $overflowId = (new Query())->select('id')->from(ActivityTable::TABLE)
                ->orderBy(['id' => \SORT_DESC])->offset(self::maxRows($settings))->limit(1)->scalar()
            ;
            while ($overflowId && $budget > 0) {
                $count = $this->clearBatch((int) $overflowId);
                if ($count) {
                    --$budget;
                }
                $deleted += $count;
                if ($count < 500) {
                    break;
                }
            }
        }
        if ($deleted) {
            $this->invalidateErrorCount();
        }
        $this->cleanupBudgetExhausted = $budget <= 0;

        return $deleted;
    }

    public function shouldContinueCleanup(): bool
    {
        return $this->cleanupBudgetExhausted;
    }

    public static function cutoff(Settings $settings): string
    {
        return gmdate('Y-m-d H:i:s', time() - 86400 * max(1, min(365, $settings->activityRetentionDays)));
    }

    public static function maxRows(Settings $settings): int
    {
        return max(1000, min(1000000, $settings->activityMaxRows));
    }

    protected function write(array $rows): void
    {
        $db = $this->database();
        $savepoint = null;
        // PostgreSQL aborts the enclosing transaction after a failed statement. Isolate Activity
        // using a nested savepoint whenever a caller explicitly flushes inside a transaction.
        if ($db->getTransaction()) {
            if (!$db->getSchema()->supportsSavepoint()) {
                return;
            }
            $savepoint = 'freeform_activity_'.bin2hex(random_bytes(6));
            $db->getSchema()->createSavepoint($savepoint);
        }

        try {
            $db->createCommand()->batchInsert(ActivityTable::TABLE, array_keys($rows[0]), array_map('array_values', $rows))->execute();
            if ($savepoint) {
                $db->getSchema()->releaseSavepoint($savepoint);
            }
        } catch (\Throwable $exception) {
            if ($savepoint) {
                $db->getSchema()->rollBackSavepoint($savepoint);
            }

            throw $exception;
        }
    }

    protected function database(): Connection
    {
        return \Craft::$app->getDb();
    }

    protected function inTransaction(): bool
    {
        return null !== $this->database()->getTransaction();
    }
}
