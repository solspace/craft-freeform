<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use yii\base\Event;

class EmailRecipientNotifications extends FeatureBundle
{
    public function __construct(private NotificationsProvider $notificationsProvider)
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        $form = $event->getForm();
        $suppressors = $form->getSuppressors();

        if ($suppressors->isSubmitterNotifications()) {
            return;
        }

        $notifications = $this->notificationsProvider->getByFormAndClass($form, EmailField::class);

        $fields = $event->getFields();
        $submission = $event->getSubmission();

        foreach ($notifications as $notification) {
            $fieldHandle = $notification->getField()?->getHandle();
            $recipient = $form->get($fieldHandle)->getValue();

            if (!$recipient) {
                continue;
            }

            $notificationTemplate = $notification->getTemplate();
            if (!$notificationTemplate) {
                continue;
            }

            $recipientCollection = new RecipientCollection();
            $recipientCollection->add(new Recipient($recipient));

            $event
                ->getMailer()
                ->sendEmail(
                    $form,
                    $recipientCollection,
                    $fields,
                    $notificationTemplate,
                    $submission
                )
            ;
        }
    }
}
