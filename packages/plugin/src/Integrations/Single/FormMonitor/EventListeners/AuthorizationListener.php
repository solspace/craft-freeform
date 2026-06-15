<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Records\IntegrationRecord;
use yii\base\Event;

class AuthorizationListener extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'onGetClient']
        );

        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
            [$this, 'onAuthorize']
        );
    }

    public function onGetClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof FormMonitor) {
            return;
        }

        $licenseKey = $this->getLicenseKey();
        $storedLicenseKey = $integration->getStoredLicenseKey();

        if ($storedLicenseKey && $storedLicenseKey !== $licenseKey) {
            $this->disableIntegration();
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

    public function onAuthorize(AuthorizeIntegrationEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof FormMonitor) {
            return;
        }

        if (!$integration->isEnabled()) {
            return;
        }

        $licenseKey = $this->getLicenseKey();
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

        $client = \Craft::createGuzzleClient();
        $response = $client->post(
            $integration->getApiRootUrl().'/handshake',
            ['json' => $payload]
        );

        $body = (string) $response->getBody();
        $json = json_decode($body);

        if (409 === $response->getStatusCode()) {
            $this->disableIntegration();

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

        Freeform::getInstance()->integrations->save($event->getModel(), $event->getIntegration());
    }

    private function getLicenseKey(): string
    {
        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        $key = \Craft::$app->plugins->getPluginLicenseKey($plugin->handle);

        return (string) $key;
    }

    private function disableIntegration(): void
    {
        $record = IntegrationRecord::find()
            ->where(['class' => FormMonitor::class])
            ->one()
        ;

        if ($record) {
            $record->enabled = false;
            $record->save();
        }
    }
}
