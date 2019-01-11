<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;

class DeleteEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $element;

    /**
     * @param Submission $element
     */
    public function __construct(Submission $element)
    {
        $this->element = $element;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['element']);
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->element;
    }
}
