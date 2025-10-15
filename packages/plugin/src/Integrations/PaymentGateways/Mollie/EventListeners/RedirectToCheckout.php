<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\ReturnUrlEvent;
use Solspace\Freeform\Events\Forms\SubmitResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RedirectToCheckout extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        Event::on(Form::class, Form::EVENT_GENERATE_RETURN_URL, [$this, 'overrideReturnUrl']);
        Event::on(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, [$this, 'overrideAjaxPayload']);
        Event::on(Form::class, Form::EVENT_ON_SUBMIT_RESPONSE, [$this, 'overrideSubmitResponse']);
    }

    public function overrideReturnUrl(ReturnUrlEvent $event): void
    {
        $checkoutUrl = $this->getCheckoutUrl($event->getForm());
        if ($checkoutUrl) {
            $event->setReturnUrl($checkoutUrl);
        }
    }

    public function overrideAjaxPayload(PrepareAjaxResponsePayloadEvent $event): void
    {
        $form = $event->getForm();
        $payload = $event->getPayload();

        // If returnUrl is already present (set via ReturnUrl pipeline), force redirect behavior
        if (!empty($payload['returnUrl'])) {
            $payload['onSuccess'] = BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL;
            $event->setPayload($payload);

            return;
        }

        // Fallback: compute checkout URL and set redirect
        $checkoutUrl = $this->getCheckoutUrl($form);
        if ($checkoutUrl) {
            $payload['returnUrl'] = $checkoutUrl;
            $payload['onSuccess'] = BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL;
            $event->setPayload($payload);
        }
    }

    public function overrideSubmitResponse(SubmitResponseEvent $event): void
    {
        $checkoutUrl = $this->getCheckoutUrl($event->getForm());
        if ($checkoutUrl) {
            $event->getResponse()->redirect($checkoutUrl);
        }
    }

    private function getCheckoutUrl(Form $form): ?string
    {
        $mollieFields = $form->getLayout()->getFields(MollieField::class);
        if (!$mollieFields->count()) {
            return null;
        }

        foreach ($mollieFields as $field) {
            $paymentId = (string) $field->getValue();
            if (!$paymentId) {
                continue;
            }

            $integration = $this->integrationsProvider->getFirstForForm($form, Mollie::class);
            if (!$integration) {
                continue;
            }

            try {
                $client = $this->clientProvider->getAuthorizedClient($integration);
                $paymentService = new MolliePaymentService($integration);
                $payment = $paymentService->getPayment($paymentId);

                $checkoutUrl = $payment['_links']['checkout']['href'] ?? null;
                if ($checkoutUrl) {
                    return $checkoutUrl;
                }
            } catch (\Throwable) {
                // ignore; fall back to default behavior
            }
        }

        return null;
    }

    private function hasMolliePayment(Form $form): bool
    {
        $mollieFields = $form->getLayout()->getFields(MollieField::class);
        if (!$mollieFields->count()) {
            return false;
        }

        foreach ($mollieFields as $field) {
            if ((string) $field->getValue()) {
                return true;
            }
        }

        return false;
    }
}
