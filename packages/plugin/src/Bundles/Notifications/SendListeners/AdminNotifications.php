<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use yii\base\Event;

class AdminNotifications extends FeatureBundle
{
    public function __construct(private NotificationsProvider $notificationsProvider)
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        $form = $event->getForm();
        $suppressors = $form->getSuppressors();

        if ($suppressors->isAdminNotifications()) {
            return;
        }

        $notifications = $this->notificationsProvider->getByFormAndClass($form, Admin::class);

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        foreach ($notifications as $notification) {
            $recipients = $notification->getRecipients();
            $template = $notification->getTemplate();

            $event
                ->getMailer()
                ->sendEmail(
                    $form,
                    $recipients,
                    $fields,
                    $template,
                    $submission,
                )
            ;
        }
    }
}
