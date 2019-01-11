<?php

namespace Solspace\Freeform\Events\Mailer;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Mailing\NotificationInterface;

class RenderEmailEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var NotificationInterface */
    private $notification;

    /** @var array */
    private $fieldValues;

    /** @var Submission */
    private $submission;

    /**
     * @param Form                  $form
     * @param NotificationInterface $notification
     * @param array                 $fieldValues
     * @param Submission|null       $submission
     */
    public function __construct(
        Form $form,
        NotificationInterface $notification,
        array $fieldValues,
        Submission $submission = null
    ) {
        $this->form         = $form;
        $this->notification = $notification;
        $this->fieldValues  = $fieldValues;
        $this->submission   = $submission;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['form', 'notification', 'fieldValues', 'submission'];
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return NotificationInterface
     */
    public function getNotification(): NotificationInterface
    {
        return $this->notification;
    }

    /**
     * @return array
     */
    public function getFieldValues(): array
    {
        return $this->fieldValues;
    }

    /**
     * @param array $fieldValues
     *
     * @return RenderEmailEvent
     */
    public function setFieldValues(array $fieldValues): RenderEmailEvent
    {
        $this->fieldValues = $fieldValues;

        return $this;
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->submission;
    }
}
