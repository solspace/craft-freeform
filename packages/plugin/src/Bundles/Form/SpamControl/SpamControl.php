<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class SpamControl implements BundleInterface
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'redirectPage']);
        Event::on(Form::class, Form::EVENT_AFTER_VALIDATE, [$this, 'handleValidation']);
    }

    public function redirectPage(HandleRequestEvent $event)
    {
        $spamReasons = $this->getSpamReasons($event->getForm());
        if ($spamReasons && $this->getSettingsService()->isSpamBehaviourReloadForm()) {
            \Craft::$app->response->redirect($event->getRequest()->getUrl());
        }
    }

    public function handleValidation(ValidationEvent $event)
    {
        $form = $event->getForm();
        if ($form->isMarkedAsSpam()) {
            $simulateSuccess = $this->getFormsService()->isSpamBehaviourSimulateSuccess();

            if ($simulateSuccess && $form->isLastPage()) {
                $this->getFormsService()->incrementSpamBlockCount($form);
            } elseif (!$simulateSuccess) {
                $this->getFormsService()->incrementSpamBlockCount($form);
            }

            $event->setValidationOverride($simulateSuccess);
        }
    }

    private function getSpamReasons(Form $form)
    {
        $bag = $form->getPropertyBag();

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
