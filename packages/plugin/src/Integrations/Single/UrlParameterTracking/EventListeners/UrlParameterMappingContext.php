<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\BuildMappingContextEvent;
use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\MailerService;
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

        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_RENDER,
            [$this, 'addEmailContext'],
        );
    }

    public function addContext(BuildMappingContextEvent $event): void
    {
        $form = $event->getForm();
        $submission = $form->getSubmission();
        if (!$submission) {
            return;
        }

        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return;
        }

        $event->addContext(
            UrlParameterTracking::TEMPLATE_KEY,
            $this->getParameters($integration, $submission),
        );
    }

    public function addEmailContext(RenderEmailEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();
        if (!$submission) {
            return;
        }

        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return;
        }

        $event->setTwigVariable(
            UrlParameterTracking::TEMPLATE_KEY,
            $this->getParameters($integration, $submission),
        );
    }

    private function getParameters(UrlParameterTracking $integration, Submission $submission): array
    {
        $urlParameterEntries = UrlTrackingParameterRecord::getForSubmission($submission)
            ->select(['value'])
            ->indexBy('name')
            ->column()
        ;

        $urlParameters = [];
        foreach ($integration->getCombinedParameters() as $parameter) {
            if (!isset($urlParameters[$parameter])) {
                $urlParameters[$parameter] = $urlParameterEntries[$parameter] ?? '';
            }
        }

        return $urlParameters;
    }
}
