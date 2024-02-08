<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2PKCEInterface;
use yii\base\Event;

class OAuth2PKCEBundle extends FeatureBundle
{
    private const CACHE_KEY_PREFIX = 'freeform-oauth2-pkce-';

    public function __construct()
    {
        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_INITIATE_AUTHENTICATION_FLOW,
            [$this, 'onAuthenticate'],
        );

        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_BEFORE_AUTHORIZE,
            [$this, 'onBeforeAuthorize'],
        );
    }

    public function onAuthenticate(InitiateAuthenticationFlowEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2PKCEInterface) {
            return;
        }

        $verifier = bin2hex(random_bytes(32));
        $codeChallenge = rtrim(
            strtr(
                base64_encode(
                    hash('sha256', $verifier, true)
                ),
                '+/',
                '-_'
            ),
            '='
        );

        $cacheKey = $this->generateCacheKey($integration);
        \Craft::$app->cache->set($cacheKey, $verifier, 300);

        $payload = $event->getPayload();
        $payload['code_challenge'] = $codeChallenge;
        $payload['code_challenge_method'] = 'S256';

        $event->setPayload($payload);
    }

    public function onBeforeAuthorize(FetchTokenEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2PKCEInterface) {
            return;
        }

        $cacheKey = $this->generateCacheKey($integration);
        $verifier = \Craft::$app->cache->get($cacheKey);
        if (!$verifier) {
            throw new \Exception('Code verifier not found');
        }

        $payload = $event->getPayload();
        $payload['code_verifier'] = $verifier;

        $event->setPayload($payload);
    }

    private function generateCacheKey(IntegrationInterface $integration): string
    {
        return self::CACHE_KEY_PREFIX.$integration->getId();
    }
}
