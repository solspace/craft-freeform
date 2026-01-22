<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\AI\xAI\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Integrations\AI\xAI\BasexAIIntegration;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class xAIClientConfiguration extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof BasexAIIntegration) {
            return;
        }

        $event->addConfig(
            [
                'headers' => [
                    'Authorization' => 'Bearer '.$integration->getApiKey(),
                    'Content-Type' => 'application/json',
                ],
            ],
        );
    }
}
