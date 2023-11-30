<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services;

class StripePaymentMethodIconService
{
    public function getIconFromPaymentMethod(?\stdClass $method): ?string
    {
        if (null === $method) {
            return null;
        }

        $type = $method->type ?? null;
        $details = $method->details ?? [];

        return match ($type) {
            'card' => $this->getCardIcon($details->brand),
            default => $this->getCardIcon($type),
        };
    }

    private function getCardIcon(string $brand): ?string
    {
        $path = __DIR__.'/../Assets/'.$brand.'.png';
        if (file_exists($path)) {
            return \Craft::$app->assetManager->getPublishedUrl($path, true);
        }

        return null;
    }
}
