<?php

namespace Solspace\Freeform\Events\Notifications;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use yii\base\Event;

class PrepareNotificationEvent extends Event
{
    public function __construct(
        private Form $form,
        private NotificationInterface $notification,
        private ?RecipientCollection $recipients,
        private ?NotificationTemplate $template = null,
    ) {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getNotification(): NotificationInterface
    {
        return $this->notification;
    }

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }

    public function setTemplate(?NotificationTemplate $template): void
    {
        $this->template = $template;
    }

    public function getRecipients(): RecipientCollection
    {
        return $this->recipients ?? new RecipientCollection();
    }

    public function setRecipients(RecipientCollection $recipients): void
    {
        $this->recipients = $recipients;
    }
}
