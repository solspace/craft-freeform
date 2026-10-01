<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class RefreshFeedJob extends BaseJob
{
    public function __construct(public string $token)
    {
        parent::__construct();
    }

    public function execute($queue): void
    {
        $feed = Freeform::getInstance()->feed;

        try {
            $feed->fetchFeed();
        } finally {
            $feed->releaseQueuedFeedRefresh($this->token);
        }
    }

    public function getTtr(): int
    {
        return 60;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Refreshing News Feed');
    }
}
