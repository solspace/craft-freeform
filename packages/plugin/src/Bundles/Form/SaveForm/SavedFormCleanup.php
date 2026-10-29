<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm;

use Solspace\Freeform\Bundles\Form\SaveForm\Events\SavedFormsPurgedEvent;
use Solspace\Freeform\Records\SavedFormRecord;
use yii\base\Event;
use yii\db\Connection;
use yii\db\Query;

class SavedFormCleanup
{
    private const BATCH_SIZE = 100;

    public function __construct(private Connection $db) {}

    public function purgeExpired(\DateTimeInterface $expirationTime, int $ttlDays): void
    {
        $cutoff = \DateTimeImmutable::createFromInterface($expirationTime)
            ->setTimezone(new \DateTimeZone('UTC'))
            ->format('Y-m-d H:i:s')
        ;
        $condition = ['<', 'dateUpdated', $cutoff];

        if (!$this->hasListeners()) {
            $this->db->createCommand()->delete(SavedFormRecord::TABLE, $condition)->execute();

            return;
        }

        $query = (new Query())->from(SavedFormRecord::TABLE)->where($condition)->orderBy(['id' => \SORT_ASC]);
        $this->purge($query, SavedFormsPurgedEvent::REASON_TTL_EXPIRED, $cutoff, $ttlDays);
    }

    public function purgeForSession(string $sessionId, int $limit): void
    {
        if ('' === $sessionId || $limit <= 0) {
            return;
        }

        $query = (new Query())
            ->from(SavedFormRecord::TABLE)
            ->where(['sessionId' => $sessionId])
            ->orderBy(['dateUpdated' => \SORT_DESC, 'id' => \SORT_DESC])
            ->offset($limit)
        ;

        if (!$this->hasListeners()) {
            $ids = $query->select(['id'])->column($this->db);
            if ($ids) {
                $this->db->createCommand()->delete(SavedFormRecord::TABLE, ['id' => $ids])->execute();
            }

            return;
        }

        $this->purge($query, SavedFormsPurgedEvent::REASON_SESSION_LIMIT);
    }

    private function hasListeners(): bool
    {
        return Event::hasHandlers(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS);
    }

    private function purge(Query $query, string $reason, ?string $cutoff = null, ?int $ttlDays = null): void
    {
        $query->select(['id', 'token', 'formId'])->limit(self::BATCH_SIZE)->noCache();

        do {
            $records = $this->db->transaction(function () use ($query): array {
                $command = $query->createCommand($this->db);
                // Lock the selected rows until deletion so another request cannot
                // refresh a draft or delete it between the snapshot and the purge.
                if (\in_array($this->db->getDriverName(), ['mysql', 'pgsql'], true)) {
                    $command = $this->db->createCommand($command->getSql().' FOR UPDATE', $command->params);
                }

                $records = $command->noCache()->queryAll();
                if ($records) {
                    $this->db->createCommand()->delete(SavedFormRecord::TABLE, ['id' => array_column($records, 'id')])->execute();
                }

                return $records;
            });

            if (!$records) {
                return;
            }

            $records = array_map(static fn (array $record): array => [
                'id' => (int) $record['id'],
                'token' => (string) $record['token'],
                'formId' => (int) $record['formId'],
            ], $records);

            try {
                Event::trigger(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS, new SavedFormsPurgedEvent($records, $reason, $cutoff, $ttlDays));
            } catch (\Throwable $exception) {
                // Cleanup has succeeded; a custom listener must not break the
                // request or prevent the remaining stale records being purged.
                \Yii::error($exception, __METHOD__);
            }
        } while (\count($records) === self::BATCH_SIZE);
    }
}
