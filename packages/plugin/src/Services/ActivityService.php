<?php

namespace Solspace\Freeform\Services;

use craft\db\Connection;
use craft\db\Query;
use craft\helpers\Db;
use craft\helpers\StringHelper;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Models\Settings;

class ActivityService extends BaseService
{
    private const MAX_EVENTS_PER_REQUEST = 100;

    private int $written = 0;
    private bool $unavailable = false;
    private array $integrationContext = [];
    private ?\WeakMap $reportedIntegrationFailures = null;
    private array $pending = [];
    private bool $cleanupBudgetExhausted = false;

    /** Logging is deliberately best-effort and may never break the operation being observed. */
    public function record(string $event, ?int $formId = null, ?int $submissionId = null, array $metadata = []): void
    {
        try {
            if ($this->unavailable || $this->written >= self::MAX_EVENTS_PER_REQUEST || !isset(ActivityPolicy::EVENTS[$event])) {
                return;
            }

            $settings = $this->getSettingsService()->getSettingsModel();
            if (!BooleanHelper::normalize($settings->activityEnabled) || !ActivityPolicy::options($settings->activityMode, $settings->activityEvents)[$event]) {
                return;
            }

            $definition = ActivityPolicy::EVENTS[$event];
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

            return BooleanHelper::normalize($settings->activityEnabled) && (ActivityPolicy::options($settings->activityMode, $settings->activityEvents)[$event] ?? false);
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
            $this->integrationContext = ['formId' => $form->getId(), 'submissionId' => $form->getSubmission()?->id, 'started' => $started, 'attempt' => $attempt];
        } catch (\Throwable) {
            $this->integrationContext = [];
        }

        try {
            return $operation();
        } catch (\Throwable $exception) {
            try {
                $alreadyReported = $exception instanceof RequestException && $exception->getResponse()
                    && ($this->integrationContext['failedStatus'] ?? null) === $exception->getResponse()->getStatusCode();
                if (!$alreadyReported && !$this->hasRecordedIntegrationFailure($exception)) {
                    $this->recordForForm('integration-error', $form, ActivityContext::integrationFailure($exception) + [
                        'integrationId' => $integrationId, 'attempt' => $attempt, 'durationMs' => ActivityContext::elapsed($started),
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
                ->where(['level' => 'error'])->andWhere(['>=', 'dateCreated', self::cutoff($settings)])->count(), 60);
        } catch (\Throwable) {
            return 0;
        }
    }

    public function invalidateErrorCount(): void
    {
        try {
            $days = $this->getSettingsService()->getSettingsModel()->activityRetentionDays;
            \Craft::$app->getCache()->delete(['freeform-activity-errors', $days]);
        } catch (\Throwable) {
            // A stale badge must never interrupt cleanup.
        }
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
