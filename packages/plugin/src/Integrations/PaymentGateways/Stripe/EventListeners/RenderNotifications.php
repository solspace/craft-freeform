<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\MailerService;
use Stripe\PaymentIntent;
use yii\base\Event;

class RenderNotifications extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_RENDER,
            [$this, 'prepareTemplateValues']
        );
    }

    public function prepareTemplateValues(RenderEmailEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        $fields = $form->getLayout()->getFields(StripeField::class);
        if (!$fields->count()) {
            return;
        }

        $payments = [];

        /** @var StripeField $field */
        foreach ($fields as $field) {
            $paymentIntentId = $field->getValue();
            if (!$paymentIntentId) {
                continue;
            }

            $intent = $field
                ->getIntegration()
                ->getStripeClient()
                ->paymentIntents
                ->retrieve(
                    $paymentIntentId,
                    ['expand' => ['customer', 'payment_method', 'invoice.subscription.plan.product']]
                )
            ;

            if ($intent) {
                $payments[$field->getHandle()] = $this->intentToModel($field, $intent);
            }
        }

        if (1 === \count($payments)) {
            $payments = reset($payments);
        }

        $event->add('payments', $payments);
    }

    private function intentToModel(StripeField $field, PaymentIntent $intent): array
    {
        return [
            'amount' => $intent->amount / 100,
            'currency' => strtoupper($intent->currency),
            'status' => $intent->status,
            'errorMessage' => $intent->last_payment_error ? $intent->last_payment_error->message : '',
            'card' => $intent->payment_method?->card?->last4,
            'type' => $field->getPaymentType(),
            'planName' => $intent->invoice?->subscription?->plan?->product?->name ?? '',
            'interval' => $intent->invoice?->subscription?->plan?->interval ?? '',
            'frequency' => $intent->invoice?->subscription?->plan?->frequency ?? '',
        ];
    }
}
