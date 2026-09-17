<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Klaviyo;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class KlaviyoBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public static function getPriority(): int
    {
        return 1500;
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof KlaviyoIntegrationInterface) {
            return;
        }

        $event->addConfig([
            'headers' => [
                'Authorization' => 'Klaviyo-API-Key '.$integration->getApiKey(),
                'revision' => $integration->getApiRevision(),
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ],
            'allow_redirects' => false,
        ]);
    }
}
