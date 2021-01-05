<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class PurgeSpamJob extends BaseJob
{
    public $age;

    public function execute($queue)
    {
        Freeform::getInstance()->spamSubmissions->purgeSubmissions($this->age);
        $this->setProgress($queue, 1);
    }

    protected function defaultDescription()
    {
        return 'Purge Spam';
    }
}
