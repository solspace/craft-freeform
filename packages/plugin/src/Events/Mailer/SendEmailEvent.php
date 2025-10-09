<?php

namespace Solspace\Freeform\Events\Mailer;

use craft\mail\Message;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\NotificationInterface;

class SendEmailEvent extends CancelableArrayableEvent
{
    public function __construct(
        private Message $message,
        private Form $form,
        private NotificationTemplate $notification,
        private array $fieldValues,
        private ?Submission $submission = null,
        private ?NotificationInterface $notificationRecord = null,
    ) {
        parent::__construct();
    }

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

    public function getNotification(): NotificationTemplate
    {
        return $this->notification;
    }

    public function getFieldValues(): array
    {
        return $this->fieldValues;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }

    public function getNotificationRecord(): ?NotificationInterface
    {
        return $this->notificationRecord;
    }
}
