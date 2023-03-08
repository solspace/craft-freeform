<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class DynamicRecipients extends FeatureBundle
{
    public const BAG_KEY = 'dynamicNotification';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event)
    {
        $form = $event->getForm();
        $suppressors = $form->getSuppressors();

        if ($suppressors->isDynamicRecipients()) {
            return;
        }

        $data = $form->getPropertyBag()->get(self::BAG_KEY);

        $template = $data['template'] ?? null;
        $recipients = $data['recipients'] ?? [];
        if (!\is_array($recipients) && !empty($recipients)) {
            $recipients = [$recipients];
        }

        if (empty($recipients) || !$template) {
            return;
        }

        $notification = Freeform::getInstance()
            ->notifications
            ->requireNotification(
                $form,
                $template,
                'Dynamic Notification from template params'
            )
        ;

        if (!$notification) {
            return;
        }

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        $event
            ->getMailer()
            ->sendEmail(
                $form,
                $recipients,
                $notification,
                $fields,
                $submission
            )
        ;
    }
}
