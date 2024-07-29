<?php

namespace Solspace\Freeform\Integrations\Single\Honeypot\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Honeypot\RenderHoneypotEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\Honeypot\Honeypot;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class HoneypotBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'addHoneypotToJson']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHoneyPotInputToForm']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateFormHoneypot']
        );

        Event::on(
            Form::class,
            Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD,
            [$this, 'attachToAjaxPayload']
        );
    }

    public function addHoneyPotInputToForm(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $event->addChunk($this->getHoneypotInput($form));
    }

    public function addHoneypotToJson(OutputAsJsonEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $event->add('honeypot', [
            'name' => $integration->getInputName(),
            'value' => '',
        ]);
    }

    public function validateFormHoneypot(ValidationEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $honeypotName = $integration->getInputName();
        $settings = $this->getSettingsService();

        $settingsModel = $settings->getSettingsModel();
        if ($settingsModel->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (
                isset($arguments['honeypot']['name'], $arguments['honeypot']['value'])
                && $honeypotName === $arguments['honeypot']['name']
                && '' === $arguments['honeypot']['value']
            ) {
                return;
            }
        } else {
            $postedValue = \Craft::$app->request->post($honeypotName);
            if ('' === $postedValue) {
                return;
            }
        }

        if ($settings->isSpamBehaviorDisplayErrors()) {
            $form->addError(Freeform::t($integration->getErrorMessage()));
        }

        $form->markAsSpam(SpamReason::TYPE_HONEYPOT, 'Honeypot check failed');
    }

    public function getHoneypotInput(Form $form): string
    {
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return '';
        }

        $honeypotName = $integration->getInputName();
        $fieldPrefix = $form->getFieldPrefix();
        $id = $fieldPrefix.$honeypotName;

        $attributes = new Attributes([
            'type' => 'text',
            'value' => '',
            'name' => $honeypotName,
            'id' => $id,
            'aria-hidden' => 'true',
            'autocomplete' => 'off',
            'tabindex' => '-1',
        ]);

        $output = '<div class="'.$id.' ff-optical" aria-hidden="true" tabindex="-1">'
            .'<label aria-hidden="true" tabindex="-1" for="'.$id.'">Leave this field blank</label>'
            .'<input'.$attributes.' />'
            .'</div>';

        $event = new RenderHoneypotEvent($output);
        Event::trigger(Honeypot::class, Honeypot::EVENT_RENDER_HONEYPOT, $event);

        return $event->getOutput();
    }

    public function attachToAjaxPayload(PrepareAjaxResponsePayloadEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $event->add('honeypot', ['name' => $integration->getInputName()]);
    }

    private function getHoneypotIntegration(Form $form): ?Honeypot
    {
        if ($form->isDisabled()->honeypot) {
            return null;
        }

        $integration = $this->integrationsProvider->getSingleton($form, Honeypot::class);
        if (!$integration) {
            return null;
        }

        return $integration;
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}
