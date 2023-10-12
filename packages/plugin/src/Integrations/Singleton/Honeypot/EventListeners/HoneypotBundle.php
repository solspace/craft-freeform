<?php

namespace Solspace\Freeform\Integrations\Singleton\Honeypot\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Honeypot\RenderHoneypotEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Singleton\Honeypot\Honeypot;
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
            /** @var array $postValues */
            $postValues = \Craft::$app->request->post();

            if (isset($postValues[$honeypotName]) && '' === $postValues[$honeypotName]) {
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

        $output = '<div class="'.$id.'" style="position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important;" aria-hidden="true" tabindex="-1">'
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
        if (!$integration || !$integration->isEnabled()) {
            return null;
        }

        return $integration;
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}
