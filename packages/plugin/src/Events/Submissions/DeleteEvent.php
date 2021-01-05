<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $element;

    public function __construct(Submission $element)
    {
        $this->element = $element;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['element']);
    }

    public function getSubmission(): Submission
    {
        return $this->element;
    }
}
