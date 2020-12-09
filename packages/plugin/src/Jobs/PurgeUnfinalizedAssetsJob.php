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
    }

    protected function defaultDescription()
    {
        return 'Purge Unfinalized Assets';
    }
}
