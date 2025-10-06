<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\EventListeners;

use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Square;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SquareClientProvider extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'handleGetAuthorizedClient']
        );
    }

    public function handleGetAuthorizedClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof Square) {
            return;
        }

        $accessToken = $integration->getAccessToken();
        if (!$accessToken) {
            return;
        }

        $event->addConfig([
            'base_uri' => $integration->getApiRootUrl(),
            RequestOptions::HEADERS => [
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
                'Square-Version' => '2023-12-13',
            ],
        ]);
    }
}
