<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Properties;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class WebhookUrlGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject, ?object $context): string
    {
        return UrlHelper::siteUrl('freeform/payments/mollie/webhook');
    }
}
