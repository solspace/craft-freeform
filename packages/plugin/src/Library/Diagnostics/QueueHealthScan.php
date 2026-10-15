<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\db\Query;
use craft\queue\Queue;

/** Inspects queue metadata without reserving, deserializing, or retrying jobs. */
class QueueHealthScan
{
    private const BATCH_SIZE = 25;
    private const WAIT_WARNING_SECONDS = 3600;

    public function __construct(private object $queue, private ?int $now = null) {}

    public function getTasks(): array
    {
        return [['type' => 'queue']];
    }

    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null, int $offset = 0): array
    {
        $result = ['cursor' => $cursor, 'maxId' => $maxId, 'offset' => 0, 'scanned' => 0, 'complete' => true, 'results' => []];
        if (!$this->queue instanceof Queue) {
            $result['results'][] = $this->issue('This queue driver does not expose Craft queue metadata. Ask your developer to check its worker and failed jobs.', skipped: true);

            return $result;
        }

        // Craft's getJobInfo() moves expired jobs back to waiting; do not call it.
        $query = (new Query())->from($this->queue->tableName)->where(['channel' => $this->queue->channel ?? 'queue']);
        $maxId ??= (int) (clone $query)->max('id', $this->queue->db);
        $result['maxId'] = $maxId;
        $rows = $query->select(['id', 'fail', 'timePushed', 'delay', 'timeUpdated', 'ttr'])
            ->andWhere(['and', ['>', 'id', $cursor], ['<=', 'id', $maxId]])
            ->orderBy(['id' => \SORT_ASC])->limit(self::BATCH_SIZE)->all($this->queue->db)
        ;
        $now = $this->now ?? time();
        foreach ($rows as $row) {
            ++$result['scanned'];
            $result['cursor'] = (int) $row['id'];
            $message = null;
            if ($row['fail']) {
                $message = 'This job failed. Review the error in Queue Manager before retrying it.';
            } elseif (null !== $row['timeUpdated']) {
                if ((int) $row['ttr'] > 0 && (int) $row['timeUpdated'] + (int) $row['ttr'] < $now) {
                    $message = 'This job has exceeded its allowed run time and may be stalled. Ask your developer to check the worker.';
                }
            } elseif ((int) $row['timePushed'] + (int) $row['delay'] + self::WAIT_WARNING_SECONDS <= $now) {
                $message = 'This job has been ready to run for at least an hour. Check that a queue worker is running.';
            }
            if ($message) {
                $result['results'][] = $this->issue($message, (int) $row['id']);
            }
        }
        $result['complete'] = \count($rows) < self::BATCH_SIZE || $result['cursor'] >= $maxId;

        return $result;
    }

    private function issue(string $message, ?int $job = null, bool $skipped = false): array
    {
        return ['context' => null === $job ? ['queueAvailable' => false] : ['job' => $job], 'message' => $message, 'skipped' => $skipped, 'informational' => false];
    }
}
