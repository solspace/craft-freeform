<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use yii\base\Event;

class FinalizePayment extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'onAfterSubmit']);
    }

    public function onAfterSubmit(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $submission = $form->getSubmission();
        if (!$submission) {
            return;
        }

        // Find PayPal field on this submission
        $paypalFields = $form->getLayout()->getFields(PayPalField::class);
        if (!$paypalFields->count()) {
            return;
        }

        foreach ($paypalFields as $field) {
            $orderId = (string) $field->getValue();
            if (!$orderId) {
                continue;
            }

            $integration = $this->integrationsProvider->getFirstForForm($form, PayPal::class);
            if (!$integration) {
                continue;
            }

            $payment = $this->findOrCreatePaymentRecord($submission, $field, $orderId, $integration);

            // Try to fetch capture details to enrich the record
            try {
                $client = $this->clientProvider->getAuthorizedClient($integration);
                [$order, $capture] = $this->fetchOrderWithRetry($client, $integration, $orderId);

                $amount = $capture->amount->value ?? null;
                $currency = $capture->amount->currency_code ?? $payment->currency;
                $status = $capture->status ?? ($order->status ?? '');

                if ($amount) {
                    $payment->amount = (float) $amount;
                }
                $payment->currency = strtoupper($currency);
                if ($status) {
                    $payment->status = (string) $status;
                }

                $payment->metadata = json_encode($this->buildMetadata($order, $capture, $payment, $orderId));
                $payment->save();
            } catch (\Throwable $e) {
                // swallow; keep pending record
            }
        }
    }

    private function findOrCreatePaymentRecord(Submission $submission, PayPalField $field, string $orderId, PayPal $integration): PaymentRecord
    {
        $payment = PaymentRecord::findOne(['submissionId' => $submission->id])
            ?? PaymentRecord::findOne(['resourceId' => $orderId, 'submissionId' => $submission->id])
            ?? new PaymentRecord();

        $payment->integrationId = $integration->getId();
        $payment->fieldId = $field->getId();
        $payment->submissionId = $submission->id;
        $payment->resourceId = $orderId;
        $payment->type = 'payment';
        $payment->currency = $field->getCurrency();
        if (!$payment->amount || $payment->amount <= 0) {
            $payment->amount = (float) (PayPalField::AMOUNT_TYPE_FIXED === $field->getAmountType() ? $field->getAmount() : 0);
        }
        if (!$payment->status) {
            $payment->status = 'pending';
        }
        if (!$payment->metadata) {
            $payment->metadata = json_encode(['gateway' => 'paypal']);
        }

        return $payment;
    }

    private function fetchOrderWithRetry($client, PayPal $integration, string $orderId): array
    {
        $order = null;
        $capture = null;

        for ($i = 0; $i < 3; ++$i) {
            $orderResponse = $client->get('/v2/checkout/orders/'.$orderId);
            $order = json_decode($orderResponse->getBody()->getContents());
            $purchaseUnit = $order->purchase_units[0] ?? null;
            $capture = $purchaseUnit->payments->captures[0] ?? null;
            if ($capture && isset($capture->status)) {
                break;
            }
            usleep(250000); // ~250ms backoff
        }

        return [$order, $capture];
    }

    private function buildMetadata(object $order, ?object $capture, PaymentRecord $payment, string $orderId): array
    {
        $payer = $order->payment_source->paypal ?? $order->payer ?? null;
        $payerEmail = $payer->email_address ?? null;
        $payerGiven = $payer->name->given_name ?? null;
        $payerSurname = $payer->name->surname ?? null;
        $payerId = $payer->payer_id ?? $payer->account_id ?? null;
        $captureId = $capture->id ?? null;

        $captureSelfLink = null;
        foreach (($capture->links ?? []) as $l) {
            if (($l->rel ?? '') === 'self') {
                $captureSelfLink = $l->href ?? null;

                break;
            }
        }

        $paypalFee = $capture->seller_receivable_breakdown->paypal_fee->value ?? null;
        $netAmount = $capture->seller_receivable_breakdown->net_amount->value ?? null;

        return [
            'gateway' => 'paypal',
            'status' => $payment->status,
            'currency' => $payment->currency,
            'amount' => $payment->amount,
            'orderId' => (string) ($order->id ?? $orderId),
            'captureId' => $captureId,
            'captureLink' => $captureSelfLink,
            'payerEmail' => $payerEmail,
            'payerGivenName' => $payerGiven,
            'payerSurname' => $payerSurname,
            'payerId' => $payerId,
            'paypalFee' => $paypalFee,
            'netAmount' => $netAmount,
            'unit' => 'dollars',
        ];
    }
}
