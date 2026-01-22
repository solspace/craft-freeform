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

namespace Solspace\Freeform\Integrations\AI\Anthropic\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Integrations\AI\Anthropic\BaseAnthropicIntegration;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class AnthropicClientConfiguration extends FeatureBundle
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
        if (!$integration instanceof BaseAnthropicIntegration) {
            return;
        }

        $event->addConfig(
            [
                'headers' => [
                    'x-api-key' => $integration->getApiKey(),
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ],
            ],
        );
    }
}
