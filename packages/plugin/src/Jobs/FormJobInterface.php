<?php

namespace Solspace\Freeform\Jobs;

use yii\queue\JobInterface;

interface FormJobInterface extends JobInterface
{
    public const EVENT_PROCESS_POSTED_DATA = 'process-posted-data';
}
