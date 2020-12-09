<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Actions\Stripe;

use Solspace\Freeform\Library\DataObjects\AbstractFormAction;
use Stripe\PaymentIntent;

class SinglePaymentAction extends AbstractFormAction
{
    const NAME = 'stripe.single_payment.payment_intent_action';

    public function __construct(PaymentIntent $intent)
    {
        parent::__construct([
            'payment_intent' => [
                'id' => $intent->id,
                'client_secret' => $intent->client_secret,
            ],
        ]);
    }

    public function getName(): string
    {
        return self::NAME;
    }
}
