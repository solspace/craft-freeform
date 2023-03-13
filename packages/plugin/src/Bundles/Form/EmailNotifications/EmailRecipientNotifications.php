<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
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

        $recipientFields = $form->getLayout()->getFields(RecipientInterface::class);
        foreach ($recipientFields as $field) {
            if (!$field->shouldReceiveEmail()) {
                continue;
            }

            if ($suppressors->isSubmitterNotifications()) {
                continue;
            }

            if ($field->isHidden()) {
                continue;
            }

            $notification = Freeform::getInstance()
                ->notifications
                ->requireNotification(
                    $form,
                    $field->getNotificationId(),
                    'Email Field: '.$field->getLabel()
                )
            ;

            $event
                ->getMailer()
                ->sendEmail(
                    $form,
                    $submission->{$field->getHandle()}->getRecipients(),
                    $notification,
                    $fields,
                    $submission
                )
            ;
        }
    }
}
