<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
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
        Event::on(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, [$this, 'handleAjaxPayload']);
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

    public function handleAjaxPayload(PrepareAjaxResponsePayloadEvent $event)
    {
        if (!$this->isHoneypotEnabled()) {
            return;
        }

        $honeypot = Freeform::getInstance()->honeypot->getHoneypot($event->getForm());
        $event->add('honeypot', [
            'name' => $honeypot->getName(),
            'hash' => $honeypot->getHash(),
        ]);
    }

    private function getSpamReasons(Form $form)
    {
        $bag = $form->getPropertyBag();

        return $bag->get(Form::PROPERTY_SPAM_REASONS, []);
    }

    private function isHoneypotEnabled(): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnabled();
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
