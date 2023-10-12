<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;

class CipherEvent extends CancelableArrayableEvent
{
    private Submission $submission;

    public function __construct(Submission $submission)
    {
        $this->submission = $submission;

        parent::__construct();
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }
}
