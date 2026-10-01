<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\MailerLite;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class MailerLiteBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public static function getPriority(): int
    {
        return 1500;
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof MailerLiteIntegrationInterface) {
            return;
        }

        $event->addConfig([
            'headers' => [
                'Authorization' => 'Bearer '.$integration->getApiKey(),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'X-Version' => '2026-09-17',
            ],
            'allow_redirects' => false,
        ]);
    }
}
