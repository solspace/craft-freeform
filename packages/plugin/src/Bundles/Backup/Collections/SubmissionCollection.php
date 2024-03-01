<?php

namespace Solspace\Freeform\Bundles\Backup\Collections;

use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Library\Collections\Collection;

class SubmissionCollection extends Collection
{
    protected static function supports(): array
    {
        return [Submission::class];
    }
}
