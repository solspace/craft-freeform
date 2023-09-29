<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\SpamReasonRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class SpamControl extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'redirectPage']);
        Event::on(Form::class, Form::EVENT_AFTER_VALIDATE, [$this, 'handleValidation']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleFormReset']);

        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_AFTER_SUBMIT,
            [$this, 'persistSpamReasons']
        );
    }

    public function redirectPage(HandleRequestEvent $event): void
    {
        $spamReasons = $this->getSpamReasons($event->getForm());
        if ($spamReasons && $this->getSettingsService()->isSpamBehaviourReloadForm()) {
            \Craft::$app->response->redirect($event->getRequest()->getUrl());
        }
    }

    public function handleValidation(ValidationEvent $event): void
    {
        $form = $event->getForm();
        if ($form->isMarkedAsSpam()) {
            if (!$form->isValid()) {
                return;
            }

            if ($form->isLastPage()) {
                $this->getFormsService()->incrementSpamBlockCount($form);
            }
        }
    }

    public function persistSpamReasons(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        if (!$submission->isSpam || !$form->isMarkedAsSpam()) {
            return;
        }

        $spamReasons = $form->getSpamReasons();
        foreach ($spamReasons as $reason) {
            $record = new SpamReasonRecord();
            $record->submissionId = $submission->getId();
            $record->reasonType = $reason['type'];
            $record->reasonMessage = $reason['message'];
            $record->save();
        }
    }

    public function handleFormReset(ResetEvent $event): void
    {
        $event->getForm()->getProperties()->set(Form::PROPERTY_SPAM_REASONS, []);
    }

    private function getSpamReasons(Form $form): array
    {
        $bag = $form->getProperties();

        return $bag->get(Form::PROPERTY_SPAM_REASONS, []);
    }

    private function getFormsService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    private function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }
}
