<?php

namespace Solspace\Freeform\Bundles\Notifications;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Events\Notifications\RegisterNotificationTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Admin\Admin;
use Solspace\Freeform\Notifications\Conditional\Conditional;
use Solspace\Freeform\Notifications\Dynamic\Dynamic;
use yii\base\Event;

class NotificationsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'sendNotifications']
        );

        Event::on(
            NotificationTypesProvider::class,
            NotificationTypesProvider::EVENT_REGISTER_NOTIFICATION_TYPES,
            [$this, 'registerNotificationTypes']
        );
    }

    public function sendNotifications(ProcessSubmissionEvent $event)
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        $submission = $event->getSubmission();
        $fields = $form->getLayout()->getFields();

        $event = new SendNotificationsEvent($form, $submission, $this->plugin()->mailer, $fields);
        Event::trigger(Form::class, Form::EVENT_SEND_NOTIFICATIONS, $event);
    }

    public function registerNotificationTypes(RegisterNotificationTypesEvent $event)
    {
        $event->addType(Admin::class);
        $event->addType(Dynamic::class);
        $event->addType(Conditional::class);
    }
}
