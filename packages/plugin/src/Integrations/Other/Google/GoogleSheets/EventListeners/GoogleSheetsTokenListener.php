<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\EventListeners;

use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\GoogleSheetsIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;

class GoogleSheetsTokenListener extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_INITIATE_AUTHENTICATION_FLOW,
            [$this, 'onInitAuthentication']
        );

        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_BEFORE_AUTHORIZE,
            [$this, 'onBeforeAuthorize']
        );

        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            [$this, 'onAfterAuthorize']
        );
    }

    public function onInitAuthentication(InitiateAuthenticationFlowEvent $event): void
    {
        $integration = $event->getIntegration();

        // Check if the integration is an instance of GoogleSheetsIntegrationInterface
        if (!$integration instanceof GoogleSheetsIntegrationInterface) {
            return;
        }

        // Define the required scopes for Google Sheets and Drive
        $scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
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

    public function onBeforeAuthorize(FetchTokenEvent $event): void
    {
        //        $integration = $event->getIntegration();
        //        if (!$integration instanceof GoogleSheetsIntegrationInterface) {
        //            return;
        //        }
        //
        //        $integration->setAccountsServer($_GET['accounts-server'] ?? '');
        //        $integration->setLocation($_GET['location'] ?? '');
    }

    public function onAfterAuthorize(TokenPayloadEvent $event): void
    {
        //        $integration = $event->getIntegration();
        //        if (!$integration instanceof GoogleSheetsIntegrationInterface) {
        //            return;
        //        }
        //
        //        $payload = $event->getResponsePayload();
        //        if (!isset($payload->api_domain)) {
        //            throw new CRMIntegrationNotFoundException("Google response data doesn't contain the API Domain");
        //        }
        //
        //        $integration->setApiDomain($payload->api_domain);
    }
}
