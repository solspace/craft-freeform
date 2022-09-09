<?php

namespace Solspace\Freeform\Bundles\Notifications;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
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
}
