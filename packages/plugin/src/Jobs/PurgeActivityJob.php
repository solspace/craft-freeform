<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class PurgeActivityJob extends BaseJob
{
    public ?int $throughId = null;

    public function execute($queue): void
    {
        if (null !== $this->throughId) {
            $service = Freeform::getInstance()->get('activity');
            $deleted = 0;
            for ($batch = 0; $batch < 20; ++$batch) {
                $count = $service->clearBatch($this->throughId);
                $deleted += $count;
                if ($count < 500) {
                    break;
                }
            }
            if ($deleted) {
                $service->invalidateErrorCount();
            }
            if ($deleted >= 10000) {
                $queue->push(new self(['throughId' => $this->throughId]));
            }

            return;
        }
        $service = Freeform::getInstance()->get('activity');
        $service->purge();
        if ($service->shouldContinueCleanup()) {
            $queue->push(new self());
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Purging Activity');
    }
}
