<?php

namespace Solspace\Freeform\Events\Submissions;

use craft\events\CancelableEvent;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;

class SubmitEvent extends CancelableEvent
{
    /** @var Submission */
    public $element;

    /** @var Form */
    public $form;

    /**
     * @param Submission $element
     * @param Form       $form
     */
    public function __construct(Submission $element, Form $form)
    {
        $this->element = $element;
        $this->form    = $form;

        parent::__construct();
    }

    /**
     * @return Submission
     */
    public function getElement(): Submission
    {
        return $this->element;
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }
}
