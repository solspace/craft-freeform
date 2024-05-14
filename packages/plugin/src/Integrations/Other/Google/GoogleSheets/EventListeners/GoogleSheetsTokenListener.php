<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\EventListeners;

use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\GoogleSheetsIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;

class GoogleSheetsTokenListener extends FeatureBundle
{
    public function __construct(
    ) {
        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_INITIATE_AUTHENTICATION_FLOW,
            [$this, 'onInitAuthentication']
        );
    }

    public function onInitAuthentication(InitiateAuthenticationFlowEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof GoogleSheetsIntegrationInterface) {
            return;
        }

        // Define the required scopes for Google Sheets and Drive
        $scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
        ];

        // Join scopes with a space delimiter
        $formattedScopes = implode(' ', $scopes);

        // Add necessary parameters to the authentication event
        $event
            ->add('scope', $formattedScopes)
            ->add('prompt', 'consent')
            ->add('access_type', 'offline')
        ;
    }
}
