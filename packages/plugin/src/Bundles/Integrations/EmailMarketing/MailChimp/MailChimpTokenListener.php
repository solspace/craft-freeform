<?php

namespace Solspace\Freeform\Bundles\Integrations\EmailMarketing\MailChimp;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Integrations\MailingLists\MailChimp\MailChimpIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;

class MailChimpTokenListener extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            [$this, 'onAfterAuthorize']
        );
    }

    public function onAfterAuthorize(TokenPayloadEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof MailChimpIntegrationInterface) {
            return;
        }

        $payload = $event->getResponsePayload();

        $client = new Client([
            'headers' => [
                'Authorization' => 'OAuth '.$payload->access_token,
            ],
        ]);

        $response = $client->get('https://login.mailchimp.com/oauth2/metadata');
        $metadata = json_decode((string) $response->getBody());

        $integration->setDataCenter($metadata->dc);
    }
}
