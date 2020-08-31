<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class PurgeUnfinalizedAssetsJob extends BaseJob
{
    public $age;

    public function execute($queue)
    {
        Freeform::getInstance()->files->cleanUpUnfinalizedAssets($this->age);
        $this->setProgress($queue, 1);
    }

    protected function defaultDescription()
    {
        return 'Purge Unfinalized Assets';
    }
}
