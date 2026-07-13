<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\ReturnUrlEvent;
use Solspace\Freeform\Events\Forms\SubmitResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use yii\base\Event;

class RedirectToCheckout extends FeatureBundle
{
    /**
     * Per-request cache of resolved checkout URLs, keyed by form instance id.
     * The Mollie field value is only available early in the submit request
     * (during return URL generation); registerContext() and render() both clear it before
     * the AJAX payload is prepared, so the URL must be resolved once and reused.
     */
    private Memo $cache;

    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        $this->cache = new Memo();

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
        if (!$this->hasMolliePayment($form)) {
            return;
        }

        // The Mollie checkout URL must always take priority over the form's own configured return URL
        // as the user still needs to complete payment before any "success" behavior applies.
        $checkoutUrl = $this->getCheckoutUrl($form);
        if ($checkoutUrl) {
            $payload = $event->getPayload();
            $payload['returnUrl'] = $checkoutUrl;
            $payload['onSuccess'] = BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL;
            $event->setPayload($payload);
        }
    }

    public function overrideSubmitResponse(SubmitResponseEvent $event): void
    {
        $form = $event->getForm();
        if (!$this->hasMolliePayment($form)) {
            return;
        }

        $checkoutUrl = $this->getCheckoutUrl($form);
        if ($checkoutUrl) {
            $event->getResponse()->redirect($checkoutUrl);
        }
    }

    private function hasMolliePayment(Form $form): bool
    {
        // Cache-aware on purpose: the field value is cleared once the form context is
        // rebuilt (registerContext() and render()), so once we've resolved a checkout URL
        // earlier in the request we must still treat this form as having a payment.
        if ($this->cache->get($this->getFormKey($form))) {
            return true;
        }

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

    private function getCheckoutUrl(Form $form): ?string
    {
        $key = $this->getFormKey($form);

        $cached = $this->cache->get($key);
        if ($cached) {
            return $cached;
        }

        $checkoutUrl = $this->fetchCheckoutUrl($form);

        // Only cache a successful lookup - the field value may be absent on this call
        // (e.g. after the form context is rebuilt) but present on an earlier one.
        if ($checkoutUrl) {
            $this->cache->set($key, $checkoutUrl);
        }

        return $checkoutUrl;
    }

    private function fetchCheckoutUrl(Form $form): ?string
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
            } catch (\Throwable $exception) {
                Freeform::getInstance()
                    ->logger
                    ->getLogger(FreeformLogger::PAYMENT_GATEWAY)
                    ->error(
                        'Mollie: failed to fetch checkout URL for payment '.$paymentId.': '.$exception->getMessage(),
                        ['exception' => $exception],
                    )
                ;
            }
        }

        return null;
    }

    private function getFormKey(Form $form): string
    {
        return (string) spl_object_id($form);
    }
}
