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

namespace Solspace\Freeform\Integrations\EmailMarketing\Brevo;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class BrevoBundle extends FeatureBundle
{
    public function __construct()
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );
    }

    public static function getPriority(): int
    {
        return 1500;
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof BrevoIntegrationInterface) {
            return;
        }

        $event->addConfig(
            [
                'headers' => [
                    'Api-Key' => $integration->getApiKey(),
                    'Content-Type' => 'application/json',
                ],
            ],
        );
    }
}
