<?php

namespace Solspace\Freeform\Jobs;

use craft\base\Event;
use craft\queue\BaseJob;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class ProcessNotificationsJob extends BaseJob
{
    public int $submissionId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $submission = $freeform->submissions->getSubmissionById($this->submissionId);
        $form = $submission->getForm();
        $fields = $submission->getFieldCollection();

        $event = new SendNotificationsEvent($form, $submission, $fields, $freeform->mailer);
        Event::trigger(Form::class, Form::EVENT_SEND_NOTIFICATIONS, $event);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process Notifications');
    }
}
