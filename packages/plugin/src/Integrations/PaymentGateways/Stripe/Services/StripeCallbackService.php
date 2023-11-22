<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\SubmissionsService;
use Stripe\PaymentIntent;

class StripeCallbackService
{
    public function __construct(private SubmissionsService $submissionsService)
    {
    }

    public function handleSavedForm(
        Form $form,
        Stripe $integration,
        StripeField $field,
        PaymentIntent $paymentIntent,
        ?SavedFormRecord $savedForm,
    ): bool {
        if (!$savedForm) {
            return false;
        }

        $stripe = $integration->getStripeClient();

        $payload = json_decode(
            \Craft::$app->security->decryptByKey(
                base64_decode($savedForm->payload),
                $paymentIntent->client_secret
            ),
            true
        );

        $paymentIntent = $stripe->paymentIntents->retrieve(
            $paymentIntent->id,
            ['expand' => ['payment_method', 'invoice.subscription']]
        );

        $form->quickLoad($payload);
        $this->submissionsService->handleSubmission($form);

        $type = null !== $paymentIntent->invoice ? 'subscription' : 'payment';

        if (!$form->getSubmission()->id) {
            return false;
        }

        $savedForm->delete();

        $payment = new PaymentRecord();
        $payment->integrationId = $integration->getId();
        $payment->fieldId = $field->getId();
        $payment->submissionId = $form->getSubmission()->id;
        $payment->resourceId = $paymentIntent->id;
        $payment->type = $type;
        $payment->currency = $paymentIntent->currency;
        $payment->amount = $paymentIntent->amount;
        $payment->status = $paymentIntent->status;

        $paymentMethod = $paymentIntent->payment_method->{$paymentIntent->payment_method->type};
        if (!\is_array($paymentMethod)) {
            $paymentMethod = $paymentMethod->toArray();
        }

        $payment->metadata = [
            'type' => $paymentIntent->payment_method->type,
            'details' => $paymentMethod,
        ];
        $payment->save();

        $submissionMetadata = [
            'submissionId' => $form->getSubmission()->id,
            'submissionLink' => UrlHelper::cpUrl('freeform/submissions/'.$form->getSubmission()->id),
        ];

        if ($paymentIntent?->invoice?->subscription) {
            $stripe
                ->subscriptions
                ->update(
                    $paymentIntent->invoice->subscription->id,
                    [
                        'metadata' => array_merge(
                            $paymentIntent->invoice->subscription->metadata->toArray(),
                            $submissionMetadata,
                        ),
                    ]
                )
            ;
        } else {
            $stripe
                ->paymentIntents
                ->update(
                    $paymentIntent->id,
                    [
                        'metadata' => array_merge(
                            $paymentIntent->metadata->toArray(),
                            $submissionMetadata,
                        ),
                    ]
                )
            ;
        }

        return true;
    }
}
