<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use Solspace\Freeform\Events\Integrations\TokensRefreshedEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class RefreshedTokenPersistence extends FeatureBundle
{
    public function __construct(private IntegrationsService $integrationsService)
    {
        Event::on(
            CRMOAuthConnector::class,
            CRMOAuthConnector::EVENT_TOKENS_REFRESHED,
            [$this, 'persistTokens']
        );
    }

    public function persistTokens(TokensRefreshedEvent $event): void
    {
        $integration = $event->getIntegration();

        $model = $this->integrationsService->getById($integration->getId());
        if (!$model) {
            return;
        }

        $this->integrationsService->updateModelFromIntegration($model, $integration);
        $this->integrationsService->save($model);
    }
}
