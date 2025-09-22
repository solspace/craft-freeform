<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class PayPalBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof PayPal) {
            return;
        }

        $base = $integration->getApiRootUrl();
        $event->addConfig([
            'base_uri' => $base,
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);
    }
}
