<?php

namespace Solspace\Freeform\Services;

use craft\db\Connection;
use craft\db\Query;
use craft\helpers\Queue;
use craft\helpers\StringHelper;
use craft\services\UserPermissions;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\FormMergeJob;
use Solspace\Freeform\Library\Forms\Merge\BackgroundMergeTables;
use Solspace\Freeform\Library\Forms\Merge\TextRules;
use Solspace\Freeform\Library\Helpers\PermissionHelper;

class BackgroundFormMergeService
{
    private const ACTIVE = ['reviewing', 'ready', 'moving'];

    private FormMergeService $merge;

    public function __construct(?FormMergeService $merge = null)
    {
        $this->merge = $merge ?? new FormMergeService();
    }

    public static function isAvailable(): bool
    {
        $db = \Craft::$app->getDb();

        return $db->tableExists(BackgroundMergeTables::JOBS) && $db->tableExists(BackgroundMergeTables::BATCHES);
    }

    public static function requireFormsAvailable(array $ids, ?int $except = null): void
    {
        if (!self::isAvailable()) {
            return;
        }
        $active = (new Query())->from(BackgroundMergeTables::JOBS)
            ->where(['status' => self::ACTIVE])
            ->andWhere(['or', ['sourceId' => $ids], ['targetId' => $ids]])
        ;
        if (null !== $except) {
            $active->andWhere(['<>', 'id', $except]);
        }
        if ($active->exists()) {
            throw new \DomainException(Freeform::t('One of these forms already has a background merge. Finish or stop it before starting another merge.'));
        }
    }

    public function start(Form $source, Form $target, array $input, array $textInput = [], bool $deleteOriginal = false): int
    {
        if (!self::isAvailable()) {
            throw new \DomainException(Freeform::t('Run Freeform’s database migrations before starting a background merge.'));
        }
        if ($source->getId() === $target->getId()) {
            throw new \DomainException(Freeform::t('Choose two different forms to merge.'));
        }

        $id = $this->withForms($source->getId(), $target->getId(), function () use ($source, $target, $input, $textInput, $deleteOriginal): int {
            return \Craft::$app->getDb()->transaction(function (Connection $db) use ($source, $target, $input, $textInput, $deleteOriginal): int {
                FormMergeService::lockForms($db, [$source->getId(), $target->getId()]);
                self::requireFormsAvailable([$source->getId(), $target->getId()]);
                $plan = $this->merge->backgroundPlan($source, $target, $input, $textInput);
                $record = [
                    'sourceId' => $source->getId(),
                    'targetId' => $target->getId(),
                    'userId' => \Craft::$app->getUser()->getId(),
                    'status' => 'reviewing',
                    'state' => $this->encode([
                        'source' => $source->getName(),
                        'target' => $target->getName(),
                        'plan' => $plan,
                        'deleteOriginal' => $deleteOriginal,
                        'reviewCursor' => 0,
                        'moveCursor' => 0,
                        'count' => 0,
                        'moved' => 0,
                        'omitted' => [],
                        'error' => null,
                    ]),
                ];
                $pk = $db->getSchema()->insert(BackgroundMergeTables::JOBS, $this->withTimestamps($record));

                return (int) $pk['id'];
            });
        });

        $this->schedule($id);

        return $id;
    }

    public function listForUser(int $userId, bool $includeOtherActiveJobs = false): array
    {
        if (!self::isAvailable()) {
            return [];
        }

        $query = (new Query())->from(BackgroundMergeTables::JOBS)->orderBy(['id' => \SORT_DESC]);
        $active = (clone $query)->where(['status' => self::ACTIVE]);
        if (!$includeOtherActiveJobs) {
            $active->andWhere(['userId' => $userId]);
        }
        $finished = $query->where(['userId' => $userId])->andWhere(['not', ['status' => self::ACTIVE]])
            ->orderBy(['dateUpdated' => \SORT_DESC, 'id' => \SORT_DESC])->limit(10)->all()
        ;

        return array_map(fn (array $row) => $this->decode($row), [...$active->all(), ...$finished]);
    }

    public function forUser(int $id, int $userId, bool $includeOtherActiveJobs = false): ?array
    {
        $record = $this->find($id);

        return $record && (
            (int) $record['userId'] === $userId
            || ($includeOtherActiveJobs && \in_array($record['status'], self::ACTIVE, true))
        ) ? $record : null;
    }

    public function canPreviewTextRules(array $job): bool
    {
        if ('ready' !== $job['status'] || empty($job['state']['plan']['textRules'])) {
            return false;
        }

        try {
            [$source, $target] = $this->resolveForms($job);
            $examples = $job['state']['plan']['textExamples'] ?? [];
            $ids = $examples ? array_column(array_merge(...array_values($examples)), 'id') : [];

            return $this->merge->canPreviewSubmissions($source, $target, $ids);
        } catch (\DomainException) {
            return false;
        }
    }

    public function apply(int $id, int $userId): void
    {
        $this->withJob($id, function () use ($id, $userId): void {
            $job = $this->forUser($id, $userId);
            if (!$job || 'ready' !== $job['status']) {
                throw new \DomainException(Freeform::t('This review is no longer awaiting approval.'));
            }
            [$source, $target] = $this->resolveForms($job);
            $state = $job['state'];
            $plan = $state['plan'];
            $setMoving = function (array $destinations, string $fingerprint) use ($job, $state): void {
                if (!$this->lockCheckpoint($job)) {
                    throw new \DomainException(Freeform::t('This review is no longer awaiting approval.'));
                }
                $state['plan']['destinations'] = $destinations;
                $state['plan']['layout'] = $fingerprint;
                $state['mappedFieldCount'] = \count($destinations) + \count(TextRules::inputIds($state['plan']['textRules'] ?? []));
                unset($state['plan']['textExamples']);
                $state['error'] = null;
                $this->save($job, $state, 'moving');
            };

            if ($plan['hasAdditions'] || !empty($plan['hasOptionMerges'])) {
                // Commit layout changes and the move checkpoint together.
                $this->assertLayout($source, $target, $plan);
                $review = $this->merge->review($source, $target, $plan['input'], false, false);
                $this->merge->merge(
                    $source,
                    $target,
                    $plan['input'],
                    false,
                    false,
                    $review['token'],
                    backgroundId: $id,
                    expectedLayout: $plan['layout'],
                    onFieldsSaved: static function (array $destinations, string $fingerprint) use ($setMoving): void {
                        $setMoving($destinations, $fingerprint);
                    },
                );
            } else {
                $this->withForms($source->getId(), $target->getId(), function () use ($source, $target, $plan, $setMoving): void {
                    $this->assertLayout($source, $target, $plan);
                    \Craft::$app->getDb()->transaction(static fn () => $setMoving($plan['destinations'], $plan['layout']));
                });
            }
        });

        $this->schedule($id);
    }

    public function resume(int $id, int $userId): void
    {
        $this->withJob($id, function () use ($id, $userId): void {
            $job = $this->forUser($id, $userId);
            if (!$job || !\in_array($job['status'], ['reviewing', 'moving'], true)) {
                throw new \DomainException(Freeform::t('This merge is no longer in progress.'));
            }
            $this->resolveForms($job);
            \Craft::$app->getDb()->transaction(function () use ($job): void {
                if (!$this->lockCheckpoint($job)) {
                    return;
                }
                $state = $job['state'];
                $state['error'] = null;
                $this->save($job, $state);
            });
        });
        $this->schedule($id);
    }

    public function stop(int $id, int $userId, bool $includeOtherActiveJobs = false): void
    {
        $this->withJob($id, function () use ($id, $userId, $includeOtherActiveJobs): void {
            $job = $this->forUser($id, $userId, $includeOtherActiveJobs);
            if (!$job || !\in_array($job['status'], self::ACTIVE, true)) {
                throw new \DomainException(Freeform::t('This merge has already stopped.'));
            }
            \Craft::$app->getDb()->transaction(function (Connection $db) use ($job): void {
                if (!$this->lockCheckpoint($job)) {
                    throw new \DomainException(Freeform::t('The job advanced before it could stop. Try again shortly.'));
                }
                if (!empty($job['state']['pendingIndex']) && !$this->merge->refreshMovedSubmissions($job['state']['pendingIndex'])) {
                    throw new \DomainException(Freeform::t('The last moved batch still needs its search update. Resume the job after the queue is available.'));
                }
                $this->finish($job, 'stopped', $db);
            });
        });
    }

    public function execute(int $id): void
    {
        $requeue = $this->withJob($id, function () use ($id): bool {
            $job = $this->find($id);
            if (!$job || !\in_array($job['status'], ['reviewing', 'moving'], true) || $job['state']['error']) {
                return false;
            }

            $actor = \Craft::$app->getUsers()->getUserById((int) $job['userId']);

            try {
                if (!$actor || !$actor->active || $actor->suspended || $actor->locked) {
                    throw new \DomainException(Freeform::t('The user who started this merge is no longer active.'));
                }
                $component = \Craft::$app->getUser();
                $previous = $component->getIdentity();
                $component->setIdentity($actor);

                try {
                    $permissions = $actor->admin ? [] : (new UserPermissions())->getPermissionsByUserId((int) $actor->id);

                    return PermissionHelper::asAuthenticatedUser(fn () => $this->process($job), $permissions);
                } finally {
                    $component->setIdentity($previous);
                }
            } catch (\Throwable $exception) {
                $this->pause($id, $exception);

                return false;
            }
        }, quiet: true);

        if ($requeue) {
            $this->schedule($id);
        }
    }

    private function process(array $job): bool
    {
        [$source, $target] = $this->resolveForms($job);
        $stopAt = microtime(true) + 5;
        for ($step = 0; $step < 12 && microtime(true) < $stopAt; ++$step) {
            if (!$this->withForms($source->getId(), $target->getId(), fn () => $this->processBatch($job, $source, $target), quiet: true)) {
                $current = $this->find((int) $job['id']);

                return \in_array($current['status'] ?? null, ['reviewing', 'moving'], true);
            }
            $job = $this->find((int) $job['id']);
        }

        return true;
    }

    private function processBatch(array $job, Form $source, Form $target): bool
    {
        $state = $job['state'];
        $plan = $state['plan'];
        $db = \Craft::$app->getDb();
        if (!empty($state['pendingIndex'])) {
            if (!$this->merge->refreshMovedSubmissions($state['pendingIndex'])) {
                throw new \DomainException(Freeform::t('A batch moved successfully, but its search update could not be queued. Resume to retry the search update.'));
            }
            unset($state['pendingIndex']);

            return $db->transaction(function () use ($job, $state): bool {
                if (!$this->lockCheckpoint($job)) {
                    return false;
                }
                $this->save($job, $state);

                return true;
            });
        }
        $this->assertLayout($source, $target, $plan);

        if ('reviewing' === $job['status']) {
            $batch = $this->merge->reviewBackgroundBatch($source, $target, $plan, $state['reviewCursor']);
            if (!$batch) {
                $db->transaction(function () use ($job, $state): void {
                    if ($this->lockCheckpoint($job)) {
                        $this->save($job, $state, 'ready');
                    }
                });

                return false;
            }
            $state['reviewCursor'] = $batch['throughId'];
            $state['count'] += $batch['count'];
            if (!empty($plan['textRules'])) {
                $state['plan']['textExamples'] = $batch['textExamples'];
            }
            foreach ($batch['omitted'] as $id => $count) {
                $state['omitted'][$id] = ($state['omitted'][$id] ?? 0) + $count;
            }

            return $db->transaction(function (Connection $db) use ($job, $state, $batch): bool {
                if (!$this->lockCheckpoint($job)) {
                    return false;
                }
                $db->createCommand()->insert(BackgroundMergeTables::BATCHES, [
                    'mergeId' => $job['id'],
                    'throughId' => $batch['throughId'],
                    'checksum' => $batch['checksum'],
                ])->execute();
                $this->save($job, $state);

                return true;
            });
        }

        $batch = (new Query())->from(BackgroundMergeTables::BATCHES)->where(['mergeId' => $job['id']])
            ->andWhere(['>', 'throughId', $state['moveCursor']])->orderBy('throughId')->one()
        ;
        if (!$batch) {
            if ($state['moved'] !== $state['count']) {
                throw new \DomainException(Freeform::t('The number of moved submissions did not match the review.'));
            }
            $db->transaction(function (Connection $db) use ($job, $state, $source, $target): void {
                if (!$this->lockCheckpoint($job)) {
                    return;
                }
                if (!empty($state['deleteOriginal'])) {
                    $job['state']['originalTrashed'] = false;
                    if ($this->merge->canDelete()) {
                        FormMergeService::lockForms($db, [$source->getId(), $target->getId()]);
                        $job['state']['originalTrashed'] = FormTrashService::trashIfEmpty($db, $source->getId());
                    }
                }
                $this->finish($job, 'done', $db);
            });

            return false;
        }

        return $db->transaction(function () use ($job, $source, $target, $plan, $batch, $state): bool {
            if (!$this->lockCheckpoint($job)) {
                return false;
            }
            $ids = $this->merge->moveBackgroundBatch($source, $target, $plan, $state['moveCursor'], (int) $batch['throughId'], $batch['checksum']);
            $state['moveCursor'] = (int) $batch['throughId'];
            $state['moved'] += array_sum(array_map('count', $ids));
            $state['pendingIndex'] = $ids;
            // Moving the rows and advancing the checkpoint must commit or roll back together.
            $this->save($job, $state);

            return true;
        });
    }

    private function lockCheckpoint(array $expected): bool
    {
        $row = \Craft::$app->getDb()->createCommand(
            'SELECT [[state]], [[status]] FROM '.BackgroundMergeTables::JOBS.' WHERE [[id]] = :id FOR UPDATE',
            [':id' => $expected['id']],
        )->queryOne();

        return $row && $row['status'] === $expected['status'] && $this->decode($row)['state'] === $expected['state'];
    }

    private function resolveForms(array $job): array
    {
        if (!FormMergeService::canAccess()) {
            throw new \DomainException(Freeform::t('You no longer have permission to run this merge.'));
        }
        $forms = Freeform::getInstance()->forms;
        $lookUp = static function (int $id) use ($forms, $job): ?Form {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)
                && !PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, $id))) {
                return null;
            }

            return $forms->getFormById($id, uniqueId: 'background-merge-'.$job['id'].'-'.$job['status']);
        };
        $source = $lookUp((int) $job['sourceId']);
        $target = $lookUp((int) $job['targetId']);
        if (!$source instanceof Regular || !$target instanceof Regular || $source->getDateArchived() || $target->getDateArchived()
            || !$this->merge->canMove($source, $target)) {
            throw new \DomainException(Freeform::t('You no longer have access to manage both forms and their submissions.'));
        }

        return [$source, $target];
    }

    private function assertLayout(Form $source, Form $target, array $plan): void
    {
        if ($plan['layout'] !== $this->merge->layoutFingerprint($source, $target)) {
            throw new \DomainException(Freeform::t('A form changed after this review started. Stop the job and review the remaining submissions again.'));
        }
    }

    private function withForms(int $source, int $target, callable $action, bool $quiet = false): mixed
    {
        $ids = [$source, $target];
        sort($ids, \SORT_NUMERIC);
        $locks = array_map(static fn (int $id) => FormMergeService::layoutLock($id), $ids);

        return $this->withLocks($locks, $action, $quiet);
    }

    private function withJob(int $id, callable $action, bool $quiet = false): mixed
    {
        return $this->withLocks(["freeform-background-form-merge-{$id}"], $action, $quiet);
    }

    private function withLocks(array $locks, callable $action, bool $quiet): mixed
    {
        $mutex = \Craft::$app->getMutex();
        $acquired = [];

        try {
            foreach ($locks as $lock) {
                if (!$mutex->acquire($lock, 0)) {
                    if ($quiet) {
                        return null;
                    }

                    throw new \DomainException(Freeform::t('This merge or one of its forms is busy. Try again shortly.'));
                }
                $acquired[] = $lock;
            }

            return $action();
        } finally {
            foreach (array_reverse($acquired) as $lock) {
                $mutex->release($lock);
            }
        }
    }

    private function schedule(int $id): void
    {
        try {
            if (null === Queue::push(new FormMergeJob(['mergeId' => $id]), ttr: 120)) {
                throw new \RuntimeException('The queue did not accept the form merge job.');
            }
        } catch (\Throwable $exception) {
            \Craft::error((string) $exception, __METHOD__);
            $this->withJob($id, fn () => $this->recordFailure($id, Freeform::t('The job could not be queued. Check the queue and resume this merge.')), quiet: true);
        }
    }

    private function pause(int $id, \Throwable $exception): void
    {
        // Database exception messages can contain submitted values from a failed insert.
        \Craft::error(\sprintf('Background form merge %d failed (%s, code %s).', $id, $exception::class, $exception->getCode()), __METHOD__);
        $this->recordFailure(
            $id,
            $exception instanceof \DomainException
                ? $exception->getMessage()
                : Freeform::t('The merge paused after a batch failed.'),
        );
    }

    private function recordFailure(int $id, string $message): void
    {
        \Craft::$app->getDb()->transaction(function (Connection $db) use ($id, $message): void {
            $row = $db->createCommand(
                'SELECT [[id]], [[state]], [[status]] FROM '.BackgroundMergeTables::JOBS.' WHERE [[id]] = :id FOR UPDATE',
                [':id' => $id],
            )->queryOne();
            if (!$row || !\in_array($row['status'], ['reviewing', 'moving'], true)) {
                return;
            }

            $job = $this->decode($row);
            $state = $job['state'];
            $state['error'] = $message;
            $this->save($job, $state);
        });
    }

    private function finish(array $job, string $status, Connection $db): void
    {
        $state = $job['state'];
        if ('moving' === $job['status'] && isset($state['plan']['destinations'])) {
            $state['mappedFieldCount'] ??= \count($state['plan']['destinations']);
        }
        if ('stopped' === $status && isset($state['plan']['input'])) {
            $plan = $state['plan'];
            $input = $plan['input'];
            if ('moving' === $job['status'] && !empty($plan['hasOptionMerges'])) {
                foreach ($input as $sourceId => $action) {
                    if (str_starts_with($action, 'options:')) {
                        $input[$sourceId] = $plan['map'][$sourceId];
                    }
                }
            }
            $state['restartMapping'] = [
                'input' => $input,
                'textRules' => array_map(
                    static fn (array $rule) => array_intersect_key($rule, array_flip(['type', 'inputs', 'outputs', 'format', 'singleWord'])),
                    $plan['textRules'] ?? [],
                ),
                'addedColumns' => 'moving' === $job['status'] ? array_intersect_key(
                    $plan['destinations'],
                    array_filter($plan['input'], static fn (string $action) => str_starts_with($action, 'add:')),
                ) : [],
            ];
        }
        unset($state['plan'], $state['pendingIndex']);
        $state['error'] = null;
        $this->save($job, $state, $status);
        $db->createCommand()->delete(BackgroundMergeTables::BATCHES, ['mergeId' => $job['id']])->execute();
    }

    private function find(int $id): ?array
    {
        if (!self::isAvailable()) {
            return null;
        }
        $row = (new Query())->from(BackgroundMergeTables::JOBS)->where(['id' => $id])->one();

        return $row ? $this->decode($row) : null;
    }

    private function save(array $job, array $state, ?string $status = null): void
    {
        \Craft::$app->getDb()->createCommand()->update(BackgroundMergeTables::JOBS, [
            'state' => $this->encode($state),
            'status' => $status ?? $job['status'],
        ], ['id' => $job['id']])->execute();
    }

    private function withTimestamps(array $record): array
    {
        $record['dateCreated'] = $record['dateUpdated'] = gmdate('Y-m-d H:i:s');
        $record['uid'] = StringHelper::UUID();

        return $record;
    }

    private function decode(array $row): array
    {
        $row['state'] = json_decode($row['state'], true, flags: \JSON_THROW_ON_ERROR);

        return $row;
    }

    private function encode(array $state): string
    {
        return json_encode($state, \JSON_THROW_ON_ERROR);
    }
}
