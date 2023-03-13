<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class AdminNotifications extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event)
    {
        $form = $event->getForm();
        $suppressors = $form->getSuppressors();

        if ($suppressors->isAdminNotifications()) {
            return;
        }

        $adminNotifications = $form->getAdminNotificationProperties();
        $notificationId = $adminNotifications->getNotificationId();
        if (!$notificationId) {
            return;
        }

        $notification = Freeform::getInstance()
            ->notifications
            ->requireNotification(
                $form,
                $notificationId,
                'Admin notification'
            )
        ;

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        $event
            ->getMailer()
            ->sendEmail(
                $form,
                $adminNotifications->getRecipientArray($submission),
                $notification,
                $fields,
                $submission
            )
        ;
    }
}
