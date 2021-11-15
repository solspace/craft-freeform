<?php

namespace Solspace\Freeform\Bundles\Form\EmailNotifications;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class DynamicRecipients extends FeatureBundle
{
    const BAG_KEY = 'dynamicNotification';

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

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        $event
            ->getMailer()
            ->sendEmail(
                $form,
                $recipients,
                $template,
                $fields,
                $submission
            )
        ;
    }
}
