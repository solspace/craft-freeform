<?php

namespace Solspace\Freeform\Jobs;

use Carbon\Carbon;
use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class WeeklyDigestJob extends BaseJob
{
    public $rangeStart;
    public $rangeEnd;

    public function execute($queue)
    {
        $rangeStart = new Carbon($this->rangeStart);
        $rangeEnd = new Carbon($this->rangeEnd);

        Freeform::getInstance()->digest->sendDigest($rangeStart, $rangeEnd);
        $this->setProgress($queue, 1);
    }

    protected function defaultDescription()
    {
        return 'Send Freeform Weekly Digest';
    }
}
