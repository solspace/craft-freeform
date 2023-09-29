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
        if ($form->isDisabled()->userSelectNotifications) {
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
            if (!\is_array($value)) {
                $value = [$value];
            }

            $defaultTemplate = $notification->getTemplate();
            $defaultRecipients = $notification->getRecipients();

            $recipientMapping = $notification->getRecipientMapping();
            foreach ($value as $selectedValue) {
                $mapping = $recipientMapping->getMappingByValue($selectedValue);

                $template = $defaultTemplate;
                $recipients = $defaultRecipients;
                if ($mapping) {
                    $template = $mapping->getTemplate() ?? $template;
                    $recipients = $mapping->getRecipients()->count() ? $mapping->getRecipients() : $recipients;
                }

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
}
