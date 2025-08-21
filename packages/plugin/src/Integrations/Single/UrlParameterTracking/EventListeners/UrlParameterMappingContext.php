<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Integrations\ProcessMappingEvent;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use yii\base\Event;

class UrlParameterMappingContext extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_BEFORE_PROCESS_MAPPING,
            [$this, 'addContext'],
        );
    }

    public function addContext(ProcessMappingEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return;
        }

        $urlParameters = [];

        $parameters = $integration->getCombinedParameters();
        foreach ($parameters as $parameter) {
            $value = $_GET[$parameter] ?? null;
            if (null !== $value) {
                $urlParameters[$parameter] = htmlspecialchars($value, \ENT_QUOTES, 'UTF-8');
            }
        }

        $event->addContext('url_parameters', $urlParameters);
    }
}
