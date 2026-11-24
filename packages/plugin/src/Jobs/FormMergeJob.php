<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\BackgroundFormMergeService;

class FormMergeJob extends BaseJob
{
    public int $mergeId;

    public function execute($queue): void
    {
        (new BackgroundFormMergeService())->execute($this->mergeId);
    }

    public function getTtr(): int
    {
        return 120;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Process background form merge');
    }
}
