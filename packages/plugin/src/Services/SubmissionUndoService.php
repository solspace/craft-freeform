<?php

namespace Solspace\Freeform\Services;

use craft\records\Element;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use yii\web\ConflictHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\GoneHttpException;
use yii\web\UnprocessableEntityHttpException;

/** Session-bound receipts for reversible submission actions and bulk operations. */
class SubmissionUndoService extends BaseService
{
    private const LIMIT = 20;
    private const LIFETIME = 1800;

    public function getHistory(): array
    {
        return array_map(static fn (array $entry) => array_intersect_key($entry, array_flip([
            'token', 'operation', 'title', 'expiresAt',
        ])), $this->history());
    }

    public function record(Submission $submission, string $operation, ?int $previousStatusId = null): void
    {
        $this->recordBatch([$this->snapshot($submission, $operation, $previousStatusId)]);
    }

    public function snapshot(Submission $submission, string $operation, ?int $previousStatusId = null): array
    {
        if (!\in_array($operation, ['status', 'approve', 'delete'], true)) {
            throw new \InvalidArgumentException('Unsupported undo operation.');
        }

        return [
            'operation' => $operation,
            'id' => $submission->id,
            'uid' => $submission->uid,
            'formId' => $submission->formId,
            'siteId' => $submission->siteId,
            'title' => $submission->title,
            'previousStatusId' => $previousStatusId,
            'statusId' => $submission->statusId,
            'isSpam' => 'approve' !== $operation && $submission->isSpam,
        ];
    }

    /** Each batch is a single history entry, containing only successful changes. */
    public function recordBatch(array $items): void
    {
        if (!$items) {
            return;
        }
        $operation = $items[0]['operation'];
        foreach ($items as $item) {
            if ($item['operation'] !== $operation || !\in_array($operation, ['status', 'approve', 'delete'], true)) {
                throw new \InvalidArgumentException('Undo batches must contain one supported operation.');
            }
        }
        $history = $this->history();
        $history[] = [
            'token' => bin2hex(random_bytes(16)),
            'operation' => $operation,
            'title' => 1 === \count($items) ? $items[0]['title'] : Freeform::t('{count} submissions', ['count' => \count($items)]),
            'items' => $items,
            'expiresAt' => $this->now() + self::LIFETIME,
        ];
        $this->writeHistory(\array_slice($history, -self::LIMIT));
    }

    public function undo(string $token): string
    {
        $history = $this->history();
        $entry = end($history);
        if (!$entry) {
            throw new GoneHttpException(Freeform::t('This undo action has expired.'));
        }
        if (!hash_equals($entry['token'], $token)) {
            throw new ConflictHttpException(Freeform::t('Undo history changed. Try the latest action.'));
        }

        // Older receipts contain the snapshot directly; retain them until they expire.
        $items = $entry['items'] ?? [$entry];
        $submissions = [];
        foreach ($items as $item) {
            $submission = $this->findSubmission($item);
            if (!$submission || $submission->uid !== $item['uid'] || $submission->formId !== $item['formId'] || $submission->isHidden) {
                $this->discardLatest($history);

                throw new ConflictHttpException(Freeform::t('This submission is no longer available to undo.'));
            }
            if (!$submission->getIsEditable()) {
                $this->discardLatest($history);

                throw new ForbiddenHttpException(Freeform::t('You no longer have permission to undo this action.'));
            }

            $matches = match ($item['operation']) {
                'status' => !$submission->trashed && $submission->isSpam === $item['isSpam'] && $submission->statusId === $item['statusId'],
                'approve' => !$submission->trashed && !$submission->isSpam,
                'delete' => $submission->trashed && $submission->isSpam === $item['isSpam'],
            };
            if (!$matches || ('status' === $item['operation'] && !$this->getStatusesService()->getStatusById($item['previousStatusId']))) {
                $this->discardLatest($history);

                throw new ConflictHttpException(Freeform::t('One or more submissions changed after the action. Nothing was undone.'));
            }
            $submissions[] = $submission;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();

        try {
            foreach ($items as $index => $item) {
                if (!$this->applyUndo($submissions[$index], $item)) {
                    throw new UnprocessableEntityHttpException(Freeform::t('Could not undo this action. Please try again.'));
                }
            }
            $transaction->commit();
        } catch (\Throwable $exception) {
            $transaction->rollBack();

            throw $exception;
        }

        $this->discardLatest($history);

        return $entry['operation'];
    }

    protected function findSubmission(array $entry): ?Submission
    {
        $element = \Craft::$app->getElements()->getElementById($entry['id'], null, $entry['siteId'], ['trashed' => null, 'isSpam' => null]);

        return $element instanceof Submission ? $element : null;
    }

    protected function applyUndo(Submission $submission, array $entry): bool
    {
        if ('delete' === $entry['operation']) {
            return \Craft::$app->getElements()->restoreElement($submission);
        }
        if ('status' === $entry['operation']) {
            $currentStatusId = $submission->statusId;
            $submission->statusId = $entry['previousStatusId'];
            if (!\Craft::$app->getElements()->saveElement($submission)) {
                $submission->statusId = $currentStatusId;

                return false;
            }

            return true;
        }

        $submission->isSpam = true;
        if (!\Craft::$app->getElements()->saveElement($submission, false, false, false)) {
            $submission->isSpam = false;

            return false;
        }
        $this->convertToSpam($submission);

        return true;
    }

    protected function convertToSpam(Submission $submission): void
    {
        $record = Element::findOne($submission->id);
        $record->type = SpamSubmission::class;
        if (!$record->save(false)) {
            throw new \RuntimeException('Could not return the submission to Spam.');
        }
        if ($this->getSettingsService()->isUpdateSearchIndexes()) {
            \Craft::$app->getSearch()->indexElementAttributes($submission);
        }
        \Craft::$app->getElements()->invalidateCachesForElementType(Submission::class);
        \Craft::$app->getElements()->invalidateCachesForElementType(SpamSubmission::class);
    }

    protected function getStatusesService(): StatusesService
    {
        return Freeform::getInstance()->statuses;
    }

    protected function readHistory(): array
    {
        return \Craft::$app->getSession()->get($this->storageKey(), []);
    }

    protected function writeHistory(array $history): void
    {
        \Craft::$app->getSession()->set($this->storageKey(), $history);
    }

    protected function now(): int
    {
        return time();
    }

    private function storageKey(): string
    {
        $userId = \Craft::$app->getUser()->getId();
        if (!$userId) {
            throw new ForbiddenHttpException('An authenticated user is required.');
        }

        return 'freeform.submissionUndo.'.$userId;
    }

    private function history(): array
    {
        $history = $this->readHistory();
        $valid = array_values(array_filter($history, fn (array $entry) => $entry['expiresAt'] > $this->now()));
        if (\count($valid) !== \count($history)) {
            $this->writeHistory($valid);
        }

        return $valid;
    }

    private function discardLatest(array $history): void
    {
        array_pop($history);
        $this->writeHistory($history);
    }
}
