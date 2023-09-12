<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use yii\base\Event;

class DynamicRecipients extends FeatureBundle
{
    public function __construct(private NotificationsProvider $notificationsProvider)
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        $form = $event->getForm();
        $suppressors = $form->getSuppressors();

        if ($suppressors->isUserSelectNotifications()) {
            return;
        }

        $notifications = $this->notificationsProvider->getByFormAndClass($form, Dynamic::class);

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        foreach ($notifications as $notification) {
            $fieldHandle = $notification->getField()?->getHandle();
            if (!$fieldHandle) {
                continue;
            }

            $value = $form->get($fieldHandle)->getValue();

            $recipients = $notification->getRecipientsFromValue($value);
            $template = $notification->getTemplateFromValue($value);

            if (!$recipients->emailsToArray() || !$template) {
                continue;
            }

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
