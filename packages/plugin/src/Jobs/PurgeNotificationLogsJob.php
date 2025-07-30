<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class PurgeNotificationLogsJob extends BaseJob
{
    public function execute($queue): void
    {
        Freeform::getInstance()->digest->purgeNotificationLogs();
    }

    protected function defaultDescription(): ?string
    {
        return 'Freeform: Purging Old Notification Logs';
    }
}
