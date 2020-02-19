<?php

namespace Solspace\Freeform\Events\Submissions;

use craft\events\CancelableEvent;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Arrayable;
use yii\base\ArrayableTrait;

class SubmitEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $element;

    /** @var Form */
    private $form;

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
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['element', 'form']);
    }

    /**
     * @deprecated Use ::getSubmission() instead
     *
     * @return Submission
     */
    public function getElement(): Submission
    {
        return $this->element;
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
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
