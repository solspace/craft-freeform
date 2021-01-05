<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Actions\Stripe;

use Solspace\Freeform\Library\DataObjects\AbstractFormAction;
use Stripe\PaymentIntent;
use Stripe\Subscription;

class SubscriptionPaymentIntentAction extends AbstractFormAction
{
    const NAME = 'stripe.subscription.payment_intent_action';

    /**
     * SubscriptionPaymentIntentAction constructor.
     */
    public function __construct(Subscription $subscription, PaymentIntent $paymentIntent)
    {
        parent::__construct([
            'subscription' => [
                'id' => $subscription->id,
            ],
            'payment_intent' => [
                'id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
            ],
        ]);
    }

    public function getName(): string
    {
        return self::NAME;
    }
}
