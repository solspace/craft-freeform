<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use GuzzleHttp\Client;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class AuthorizationListener extends FeatureBundle
{
    public function __construct(
        private IntegrationsService $integrationsService,
    ) {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'onGetClient']
        );

        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_AFTER_SAVE,
            [$this, 'onSave']
        );
    }

    public function onGetClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof FormMonitor) {
            return;
        }

        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        $licenseKey = \Craft::$app->plugins->getPluginLicenseKey($plugin->id);
        $storedLicenseKey = $integration->getStoredLicenseKey();

        if ($storedLicenseKey && $storedLicenseKey !== $licenseKey) {
            // Disable the integration in the database
            $record = IntegrationRecord::find()
                ->where(['class' => FormMonitor::class])
                ->one()
            ;

            if ($record) {
                $record->enabled = false;
                $record->save();
            }
        }

        $event->addConfig([
            'headers' => [
                'Authorization' => 'Token '.$integration->getApiKey(),
                'X-License-Key' => $licenseKey,
                'X-Craft-Version' => \Craft::$app->version,
                'X-Freeform-Version' => Freeform::getInstance()->getVersion(),
            ],
        ]);
    }

    public function onSave(SaveEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof FormMonitor) {
            return;
        }

        if (!$integration->isEnabled()) {
            return;
        }

        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        $licenseKey = \Craft::$app->plugins->getPluginLicenseKey($plugin->id);
        $storedLicenseKey = $integration->getStoredLicenseKey();

        $payload = [
            'url' => \Craft::$app->getSites()->getPrimarySite()->baseUrl,
            'email' => $integration->getEmail(),
            'key' => $licenseKey,
            'siteName' => $integration->getSiteName(),
            'timeZone' => \Craft::$app->getTimeZone() ?? 'UTC',
        ];

        // Always include oldKey if changed
        if ($storedLicenseKey && $storedLicenseKey !== $licenseKey) {
            $payload['oldKey'] = $storedLicenseKey;
        }

        $client = new Client();
        $response = $client->post(
            $integration->getApiRootUrl().'/handshake',
            ['json' => $payload]
        );

        $body = (string) $response->getBody();
        $json = json_decode($body);

        if (409 === $response->getStatusCode()) {
            // Disable the integration in the database
            $record = IntegrationRecord::find()
                ->where(['class' => FormMonitor::class])
                ->one()
            ;

            if ($record) {
                $record->enabled = false;
                $record->save();
            }

            throw new IntegrationException('Failed to authorize Form Monitor: Freeform license key has changed. Please contact support.');
        }

        if (201 !== $response->getStatusCode()) {
            throw new IntegrationException('Failed to authorize Form Monitor: '.$body);
        }

        if (!isset($json->apiKey)) {
            throw new IntegrationException('Failed to authorize Form Monitor: No API Key present.');
        }

        if (!isset($json->requestToken)) {
            throw new IntegrationException('Failed to authorize Form Monitor: No Request Token present.');
        }

        $integration->setApiKey($json->apiKey);
        $integration->setRequestToken($json->requestToken);
        $integration->setStoredLicenseKey($licenseKey);

        $model = $event->getModel();
        $this->integrationsService->save($model, $integration);
    }
}
