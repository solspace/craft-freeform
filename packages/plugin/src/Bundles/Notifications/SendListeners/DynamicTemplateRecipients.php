<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use yii\base\Event;

class DynamicTemplateRecipients extends FeatureBundle
{
    public const BAG_KEY = 'dynamicNotification';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        $form = $event->getForm();
        if ($form->isDisabled()->userSelectNotifications) {
            return;
        }

        $data = $form->getProperties()->get(self::BAG_KEY);

        $template = $data['template'] ?? null;
        $recipients = $data['recipients'] ?? [];

        $recipientCollection = new RecipientCollection();

        if (\is_array($recipients)) {
            foreach ($recipients as $recipient) {
                $recipientCollection->add(new Recipient($recipient, ''));
            }
        } else {
            $recipientCollection->add(new Recipient($recipients, ''));
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

        $notificationTemplate = NotificationTemplate::fromRecord($notification);

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        $event
            ->getMailer()
            ->sendEmail(
                $form,
                $recipients,
                $fields,
                $notificationTemplate,
                $submission
            )
        ;
    }
}
