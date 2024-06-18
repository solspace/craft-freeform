<?php

namespace Solspace\Freeform\Jobs;

use Carbon\Carbon;
use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class SendDigestJob extends BaseJob
{
    public function __construct(public Carbon $refDate)
    {
        parent::__construct();
    }

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->feed->fetchFeed();
        $freeform->digest->triggerDigest($this->refDate);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Sending Digest Email');
    }
}
