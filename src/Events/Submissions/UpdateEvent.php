<?php

namespace Solspace\Freeform\Events\Submissions;

use craft\events\CancelableEvent;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Arrayable;
use yii\base\ArrayableTrait;

class UpdateEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $submission;

    /** @var Form */
    private $form;

    /**
     * @param Submission $submission
     * @param Form       $form
     */
    public function __construct(Submission $submission, Form $form)
    {
        $this->submission = $submission;
        $this->form       = $form;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['submission', 'form']);
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }
}
