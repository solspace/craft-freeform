<?php

namespace Solspace\Freeform\Events\Submissions;

use craft\events\CancelableEvent;
use Solspace\Freeform\Elements\Submission;

class DeleteEvent extends CancelableEvent
{
    /** @var Submission */
    public $element;

    /**
     * @param Submission $element
     */
    public function __construct(Submission $element)
    {
        $this->element = $element;

        parent::__construct();
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->element;
    }
}
