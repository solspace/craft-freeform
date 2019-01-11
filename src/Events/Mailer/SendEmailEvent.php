<?php

namespace Solspace\Freeform\Events\Mailer;

use craft\mail\Message;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Mailing\NotificationInterface;

class SendEmailEvent extends CancelableArrayableEvent
{
    /** @var Message */
    private $message;

    /** @var Form */
    private $form;

    /** @var NotificationInterface */
    private $notification;

    /** @var array */
    private $fieldValues;

    /** @var Submission */
    private $submission;

    /**
     * @param Message               $message
     * @param Form                  $form
     * @param NotificationInterface $notification
     * @param array                 $fieldValues
     * @param Submission|null       $submission
     */
    public function __construct(
        Message $message,
        Form $form,
        NotificationInterface $notification,
        array $fieldValues,
        Submission $submission = null
    ) {
        $this->message      = $message;
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
        return array_merge(parent::fields(), ['message', 'form', 'notification', 'fieldValues', 'submission']);
    }

    /**
     * @return Message
     */
    public function getMessage(): Message
    {
        return $this->message;
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
     * @return Submission|null
     */
    public function getSubmission()
    {
        return $this->submission;
    }
}
