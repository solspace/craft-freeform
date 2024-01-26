<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class SendDigestJob extends BaseJob
{
    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->feed->fetchFeed();
        $freeform->digest->triggerDigest();
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Send Digest Email');
    }
}
