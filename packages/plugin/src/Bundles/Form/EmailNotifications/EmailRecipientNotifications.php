<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Fields\DynamicRecipientField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class EmailRecipientNotifications extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event)
    {
        $form = $event->getForm();
        $fields = $event->getFields();
        $submission = $event->getSubmission();
        $suppressors = $form->getSuppressors();

        $recipientFields = $form->getLayout()->getRecipientFields();
        foreach ($recipientFields as $field) {
            if ($field instanceof DynamicRecipientField && $suppressors->isDynamicRecipients()) {
                continue;
            }

            if (!$field instanceof DynamicRecipientField && $suppressors->isSubmitterNotifications()) {
                continue;
            }

            if ($field->isHidden()) {
                continue;
            }

            $event
                ->getMailer()
                ->sendEmail(
                    $form,
                    $submission->{$field->getHandle()}->getRecipients(),
                    $field->getNotificationId(),
                    $fields,
                    $submission
                )
            ;
        }
    }
}
