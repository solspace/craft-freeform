<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;

/** Allow feed refresh jobs queued before the v6 upgrade to finish harmlessly. */
class RefreshFeedJob extends BaseJob
{
    public function __construct(public string $token = '')
    {
        parent::__construct();
    }

    public function execute($queue): void {}
}
