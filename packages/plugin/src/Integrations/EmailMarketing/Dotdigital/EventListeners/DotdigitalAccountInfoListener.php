<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\EventListeners;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\DotdigitalIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class DotdigitalAccountInfoListener extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_BEFORE_SAVE,
            [$this, 'processAccountInfo']
        );
    }

    public function processAccountInfo(SaveEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof DotdigitalIntegrationInterface) {
            return;
        }

        $client = new Client([
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'auth' => [
                $integration->getApiUserEmail(),
                $integration->getApiUserPassword(),
            ],
        ]);

        $response = $client->get('https://r1-api.dotdigital.com/v2/account-info');

        $json = json_decode((string) $response->getBody());

        if (isset($json)) {
            $properties = array_filter($json->properties, fn ($property) => 'ApiEndpoint' === $property->name);

            if (!empty($properties)) {
                $integration->setApiUrl($properties[0]->value);
            }
        }
    }
}
