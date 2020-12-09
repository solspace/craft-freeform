<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\helpers\Db;
use Solspace\Freeform\Records\LockRecord;
use yii\db\Query;

class LockService
{
    private $lockCache;

    public function isLocked(string $key, int $seconds): bool
    {
        if (!\Craft::$app->db->tableExists(LockRecord::TABLE)) {
            return false;
        }

        $date = new Carbon('now -'.$seconds.' seconds');
        $date->setTimezone('UTC');

        $locks = $this->getRecentLocks();
        $lockDate = $locks[$key] ?? null;

        if (null === $lockDate || $lockDate->lt($date)) {
            $record = new LockRecord();
            $record->key = $key;
            $record->save();

            $this->lockCache[$key] = new Carbon($record->dateCreated, 'UTC');

            return false;
        }

        return true;
    }

    private function getRecentLocks(): array
    {
        if (null === $this->lockCache) {
            $this->cleanup();

            $query = (new Query())
                ->select(['[[key]]', 'MAX([[dateCreated]]) as date'])
                ->from(LockRecord::TABLE)
                ->groupBy('[[key]]')
            ;

            $results = $query->all();
            $locks = [];
            foreach ($results as $result) {
                $locks[$result['key']] = new Carbon($result['date'], 'UTC');
            }

            $this->lockCache = $locks;
        }

        return $this->lockCache;
    }

    private function cleanup()
    {
        $date = new \DateTime('-1 week');
        \Craft::$app->db
            ->createCommand()
            ->delete(LockRecord::TABLE, Db::parseDateParam('dateCreated', $date, '<'))
            ->execute()
        ;
    }
}
