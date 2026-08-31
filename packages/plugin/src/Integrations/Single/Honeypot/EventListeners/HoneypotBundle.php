<?php

namespace Solspace\Freeform\Integrations\Single\Honeypot\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
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
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class HoneypotBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationLoggerProvider $loggerProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'attachToJson']
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

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $event->add('honeypot', $this->getIntegrationAttributes($integration));
    }

    public function validateFormHoneypot(ValidationEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getHoneypotIntegration($form);
        if (!$integration) {
            return;
        }

        $logger = $this->loggerProvider->getLogger($integration);

        $honeypotName = $integration->getInputName();
        $settings = $this->getSettingsService();
        if ($settings->isBypassSpamCheckOnLoggedInUsers() && \Craft::$app->getUser()->id) {
            $logger->debug('Skipping honeypot check for logged in user');

            return;
        }

        $postedValue = \Craft::$app->request->post($honeypotName);

        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (
                isset($arguments['honeypot']['name'], $arguments['honeypot']['value'])
                && $honeypotName === $arguments['honeypot']['name']
                && '' === $arguments['honeypot']['value']
            ) {
                $logger->debug('Honeypot check passed for GraphQL request');

                return;
            }
        } elseif ($form->isHeadlessPosted()) {
            $payload = $form->getProperties()->get('headlessPayload', []);
            $meta = \is_array($payload['meta'] ?? null) ? $payload['meta'] : [];
            $values = \is_array($payload['values'] ?? null) ? $payload['values'] : [];

            if (
                isset($meta['honeypot']['name'], $meta['honeypot']['value'])
                && $honeypotName === $meta['honeypot']['name']
                && '' === $meta['honeypot']['value']
            ) {
                $logger->debug('Honeypot check passed for headless request');

                return;
            }

            if (\array_key_exists($honeypotName, $values) && '' === $values[$honeypotName]) {
                $logger->debug('Honeypot check passed for headless values');

                return;
            }
        } else {
            if ('' === $postedValue) {
                $logger->debug('Honeypot check passed successfully for POST request');

                return;
            }
        }

        if ($settings->isSpamBehaviorDisplayErrors()) {
            $form->addError(Freeform::t($integration->getErrorMessage()));
        }

        $form->markAsSpam(SpamReason::TYPE_HONEYPOT, 'Honeypot check failed', $postedValue);
        $logger->debug('Honeypot check failed. Form marked as spam.', ['error' => $integration->getErrorMessage(), 'value' => $postedValue]);
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

        $event->add('honeypot', $this->getIntegrationAttributes($integration));
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

    private function getIntegrationAttributes(IntegrationInterface $integration): array
    {
        return [
            'errorMessage' => $integration->getErrorMessage(),
            'name' => $integration->getInputName(),

            /*
             * @deprecated - this attribute is no longer used
             *
             * @remove - Freeform 6.0
             */
            'value' => '',
        ];
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}
