<?php

namespace Solspace\Freeform\Integrations\CRM\MicrosoftDynamics;

use GuzzleHttp\Client;
use Psr\Http\Message\RequestInterface;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use yii\base\Event;

class MicrosoftDynamicsBundle extends FeatureBundle
{
    public function __construct(private MicrosoftDynamicsTokenProvider $tokenProvider)
    {
        Event::on(IntegrationClientProvider::class, IntegrationClientProvider::EVENT_GET_CLIENT, [$this, 'configureClient']);
        Event::on(MicrosoftDynamics::class, MicrosoftDynamics::EVENT_PROCESS_VALUE, [$this, 'processValue']);
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof MicrosoftDynamics) {
            return;
        }

        $event->addConfig([
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json; charset=utf-8',
                'OData-MaxVersion' => '4.0',
                'OData-Version' => '4.0',
            ],
            'allow_redirects' => false,
            'timeout' => 30,
            'connect_timeout' => 10,
        ]);

        $tokenClient = $this->createTokenClient();
        $provider = $this->tokenProvider;
        $event->pushToStack(static function (callable $handler) use ($integration, $tokenClient, $provider) {
            return static function (RequestInterface $request, array $options) use ($handler, $integration, $tokenClient, $provider) {
                $uri = $request->getUri();
                if ($uri->getScheme().'://'.$uri->getAuthority() !== $integration->getEnvironmentUrl()
                    || !str_starts_with($uri->getPath(), '/api/data/v9.2/')
                ) {
                    throw new IntegrationException('Refusing to send a Microsoft Dynamics access token outside the configured environment API.');
                }

                // Acquire at request time, inside Freeform's push error handling, and renew
                // expired tokens even when an authorized client is reused by a queue worker.
                $token = $provider->getAccessToken($integration, $tokenClient);

                return $handler($request->withHeader('Authorization', 'Bearer '.$token), $options);
            };
        }, 'microsoft-dynamics-auth');
    }

    public function processValue(ProcessValueEvent $event): void
    {
        $event->setValue(MicrosoftDynamicsValueConverter::convert(
            $event->getIntegrationField(),
            $event->getValue(),
            $event->getFreeformField(),
        ));
        // Class listeners run before the shared interface processor. Preserve signed numbers,
        // zero and explicit false values instead of letting the generic casts change them.
        $event->handled = true;
    }

    protected function createTokenClient(): Client
    {
        return \Craft::createGuzzleClient();
    }
}
