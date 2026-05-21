<?php

namespace Solspace\Freeform\Integrations\AI\SolspaceAI\EventListeners;

use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use yii\base\Event;

class AuthorizationListener extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
            [$this, 'onAuthorize']
        );
    }

    public function onAuthorize(AuthorizeIntegrationEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof BaseSolspaceAIIntegration) {
            return;
        }

        if (!$integration->isEnabled()) {
            return;
        }

        $contactEmail = $integration->getContactEmail();
        $siteUrl = $integration->getSiteUrl();

        if ('' === $contactEmail) {
            $event->addError(Freeform::t('Contact Email is required to authorize SolspaceAI.'));

            return;
        }

        if ('' === $siteUrl) {
            $event->addError(Freeform::t('Site URL is required to authorize SolspaceAI.'));

            return;
        }

        $licenseKey = $this->getLicenseKey();
        if ('' === $licenseKey) {
            $event->addError(Freeform::t('Freeform license key is missing. Please add your license key in Craft.'));

            return;
        }

        $apiBaseUrl = rtrim($integration->getApiBaseUrl(), '/');
        $url = $apiBaseUrl.'/freeform/enable-ai';
        $payload = [
            'license_key' => $licenseKey,
            'contact_email' => $contactEmail,
            'site_url' => $siteUrl,
        ];

        try {
            $client = \Craft::createGuzzleClient(['timeout' => 15]);
            $response = $client->post($url, [
                'json' => $payload,
                'http_errors' => false,
            ]);
        } catch (GuzzleException $e) {
            $message = $e->getMessage();
            if ($e instanceof RequestException && $e->hasResponse()) {
                $body = (string) $e->getResponse()->getBody();
                if ('' !== $body) {
                    $message = $body;
                }
            }
            $event->addError(Freeform::t('SolspaceAI authorization failed: {message}', ['message' => $message]));

            return;
        }

        $statusCode = $response->getStatusCode();
        $body = (string) $response->getBody();
        $data = json_decode($body, true);

        if (201 !== $statusCode) {
            $detail = \is_array($data) && isset($data['detail']) ? $data['detail'] : $body;
            $event->addError(Freeform::t('SolspaceAI authorization failed: {detail}', ['detail' => $detail]));

            return;
        }

        if (empty($data['api_key'])) {
            $event->addError(Freeform::t('SolspaceAI did not return an API key.'));

            return;
        }

        $integration->setApiKey($data['api_key']);

        Freeform::getInstance()->integrations->save($event->getModel(), $integration);
    }

    private function getLicenseKey(): string
    {
        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        if (!$plugin) {
            return '';
        }
        $key = \Craft::$app->plugins->getPluginLicenseKey($plugin->id);

        return (string) $key;
    }
}
