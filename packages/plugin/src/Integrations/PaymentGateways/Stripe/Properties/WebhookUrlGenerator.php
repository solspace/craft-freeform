<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Properties;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class WebhookUrlGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): string
    {
        return UrlHelper::siteUrl('freeform/payments/stripe/webhook');
    }
}
