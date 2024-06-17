<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\SendDynamicRecipientsNotificationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use yii\base\Event;

class DynamicRecipients extends FeatureBundle
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private FreeformQueueHandler $queueHandler
    ) {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if ($form->isDisabled()->userSelectNotifications) {
            return;
        }

        if (!$this->notificationsProvider->getByFormAndClass($form, Dynamic::class)) {
            return;
        }

        $this->queueHandler->executeNotificationJob(
            new SendDynamicRecipientsNotificationsJob([
                'submissionId' => $event->getSubmission()->getId(),
            ])
        );
    }
}
