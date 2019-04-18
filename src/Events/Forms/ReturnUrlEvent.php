<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class ReturnUrlEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var Submission */
    private $submission;

    /** @var string */
    private $returnUrl;

    /**
     * ReturnUrlEvent constructor.
     *
     * @param Form       $form
     * @param Submission $submission
     * @param string     $returnUrl
     */
    public function __construct(Form $form, Submission $submission = null, string $returnUrl = null)
    {
        $this->form       = $form;
        $this->submission = $submission;
        $this->returnUrl  = $returnUrl;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['form', 'submission', 'returnUrl'];
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

    /**
     * @return string|null
     */
    public function getReturnUrl()
    {
        return $this->returnUrl;
    }

    /**
     * @param string $returnUrl
     *
     * @return ReturnUrlEvent
     */
    public function setReturnUrl(string $returnUrl = null): ReturnUrlEvent
    {
        $this->returnUrl = $returnUrl;

        return $this;
    }
}
