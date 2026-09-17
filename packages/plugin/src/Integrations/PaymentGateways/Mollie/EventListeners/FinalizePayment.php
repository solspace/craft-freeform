<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePriceService;
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

        // Find Mollie field on this submission
        $mollieFields = $form->getLayout()->getFields(MollieField::class);
        if (!$mollieFields->count()) {
            return;
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

            $payment = $this->findOrCreatePaymentRecord($submission, $field, $paymentId, $integration, $form);

            // Try to fetch payment details from Mollie to enrich the record
            try {
                $this->clientProvider->getAuthorizedClient($integration);
                $paymentService = new MolliePaymentService($integration);
                $molliePayment = $paymentService->getPayment($paymentId);

                $amount = $molliePayment['amount']['value'] ?? null;
                $currency = $molliePayment['amount']['currency'] ?? $payment->currency;
                $status = $molliePayment['status'] ?? 'pending';

                if ($amount) {
                    $payment->amount = (float) $amount;
                }
                $payment->currency = strtoupper($currency);
                $payment->status = (string) $status;

                $payment->metadata = json_encode($this->buildMetadata($molliePayment, $payment, $paymentId));
            } catch (\Throwable $e) {
                // swallow; keep pending record
            }

            try {
                $payment->save();
            } catch (\Throwable) {
                // swallow; a duplicate or otherwise invalid resourceId shouldn't fail the whole submission
            }

            // Stash the payment reference for the post-checkout return handler. The
            // redirect URL sent to Mollie is fixed at payment-creation time (before the
            // submission exists), so the return controller resolves the payment via the
            // session rather than a query parameter Mollie cannot append.
            $this->storeReturnContext($form, $paymentId);
        }
    }

    private function storeReturnContext(Form $form, string $paymentId): void
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsConsoleRequest()) {
            return;
        }

        $sourceUrl = (string) $request->post(Form::SOURCE_URL_KEY);
        if ('' === $sourceUrl) {
            $payload = $form->getProperties()->get('headlessPayload');
            if (\is_array($payload)) {
                $sourceUrl = (string) ($payload['context']['sourceUrl'] ?? '');
            }
        }

        if ('' !== $sourceUrl && false === filter_var($sourceUrl, \FILTER_VALIDATE_URL)) {
            $sourceUrl = '';
        }

        \Craft::$app->getSession()->set(
            Mollie::SESSION_RETURN_KEY.$form->getId(),
            [
                'paymentId' => $paymentId,
                'sourceUrl' => $sourceUrl,
            ]
        );
    }

    private function findOrCreatePaymentRecord(Submission $submission, MollieField $field, string $paymentId, Mollie $integration, Form $form): PaymentRecord
    {
        $payment = PaymentRecord::findOne(['submissionId' => $submission->id])
            ?? new PaymentRecord();

        $payment->integrationId = $integration->getId();
        $payment->fieldId = $field->getId();
        $payment->submissionId = $submission->id;
        $payment->resourceId = $paymentId;
        $payment->type = 'payment';
        $payment->currency = $field->getCurrency();

        if (!$payment->amount || $payment->amount <= 0) {
            $priceService = new MolliePriceService();
            $amount = $priceService->getAmount($form, $field) / 100; // Convert from cents
            $payment->amount = $amount;
        }

        if (!$payment->status) {
            $payment->status = 'pending';
        }

        if (!$payment->metadata) {
            $payment->metadata = json_encode(['gateway' => 'mollie']);
        }

        // We intentionally do not save here. The save lives in onAfterSubmit() so a duplicate/invalid resourceId
        // can't throw an uncaught IntegrityException and 500 the whole submission.

        return $payment;
    }

    private function buildMetadata(array $molliePayment, PaymentRecord $payment, string $paymentId): array
    {
        return [
            'gateway' => 'mollie',
            'paymentId' => $paymentId,
            'method' => $molliePayment['method'] ?? null,
            'description' => $molliePayment['description'] ?? null,
            'status' => $molliePayment['status'] ?? 'pending',
            'amount' => $molliePayment['amount']['value'] ?? $payment->amount,
            'currency' => $molliePayment['amount']['currency'] ?? $payment->currency,
            'createdAt' => $molliePayment['createdAt'] ?? null,
            'paidAt' => $molliePayment['paidAt'] ?? null,
        ];
    }
}
