<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\CampaignMonitor;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CampaignMonitorTokenListener extends FeatureBundle
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
        if (!$integration instanceof CampaignMonitorIntegrationInterface) {
            return;
        }

        $event->addConfig(
            [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'auth' => [
                    $integration->getApiKey(),
                    '',
                ],
            ],
        );
    }
}
