<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class AfterSubmitEvent extends Event
{
    /** @var Form */
    public $form;

    /** @var Submission */
    public $submission;

    /**
     * @param Form            $form
     * @param Submission|null $submission
     */
    public function __construct(Form $form, Submission $submission = null)
    {
        $this->form       = $form;
        $this->submission = $submission;

        parent::__construct();
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return Submission|null
     */
    public function getSubmission()
    {
        return $this->submission;
    }
}
