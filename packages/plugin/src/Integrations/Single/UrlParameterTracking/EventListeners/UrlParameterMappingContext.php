<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Integrations\BuildMappingContextEvent;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use yii\base\Event;

class UrlParameterMappingContext extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            IntegrationInterface::class,
            IntegrationInterface::EVENT_BUILD_MAPPING_CONTEXT,
            [$this, 'addContext'],
        );
    }

    public function addContext(BuildMappingContextEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return;
        }

        $urlParameters = [];

        $parameters = $integration->getCombinedParameters();
        foreach ($parameters as $parameter) {
            $value = $_GET[$parameter] ?? '';
            if ('' !== $value) {
                if (\is_array($value)) {
                    $value = implode(',', $value);
                } elseif (!\is_string($value)) {
                    $value = (string) $value;
                }

                $value = htmlspecialchars($value, \ENT_QUOTES, 'UTF-8');
            }

            $urlParameters[$parameter] = $value;
        }

        $event->addContext('url_parameters', $urlParameters);
    }
}
