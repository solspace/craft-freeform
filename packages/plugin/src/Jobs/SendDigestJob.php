<?php

namespace Solspace\Freeform\Jobs;

use Carbon\Carbon;
use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class SendDigestJob extends BaseJob
{
    public $unique = true;

    public function __construct(public Carbon $refDate)
    {
        parent::__construct();
    }

    public function execute($queue): void
    {
        try {
            $freeform = Freeform::getInstance();

            $freeform->feed->fetchFeed();
            $freeform->digest->triggerDigest($this->refDate);
        } catch (\Throwable $exception) {
            \Craft::error('SendDigestJob execute - Failed: '.$exception->getMessage(), __METHOD__);

            throw $exception;
        }
    }

    public function getTtr(): int
    {
        return 300; // time to reserve (seconds)
    }

    public function canRetry($attempt, $error): bool
    {
        return false;
    }

    public function getUniqueId(): string
    {
        return 'send-digest-job-'.$this->refDate->format('Y-m-d');
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Sending Digest Email');
    }
}
