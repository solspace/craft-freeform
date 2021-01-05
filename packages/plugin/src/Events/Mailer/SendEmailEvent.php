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

    public function __construct(
        Message $message,
        Form $form,
        NotificationInterface $notification,
        array $fieldValues,
        Submission $submission = null
    ) {
        $this->message = $message;
        $this->form = $form;
        $this->notification = $notification;
        $this->fieldValues = $fieldValues;
        $this->submission = $submission;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['message', 'form', 'notification', 'fieldValues', 'submission']);
    }

    public function getMessage(): Message
    {
        return $this->message;
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getNotification(): NotificationInterface
    {
        return $this->notification;
    }

    public function getFieldValues(): array
    {
        return $this->fieldValues;
    }

    /**
     * @return null|Submission
     */
    public function getSubmission()
    {
        return $this->submission;
    }
}
