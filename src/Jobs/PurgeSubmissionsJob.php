<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class PurgeSubmissionsJob extends BaseJob
{
    public $age;

    public function execute($queue)
    {
        Freeform::getInstance()->submissions->purgeSubmissions($this->age);
    }

    protected function defaultDescription()
    {
        return 'Purge Submissions';
    }
}
