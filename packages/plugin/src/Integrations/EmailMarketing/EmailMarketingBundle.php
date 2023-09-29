<?php

namespace Solspace\Freeform\Integrations\EmailMarketing;

use Composer\ClassMapGenerator\ClassMapGenerator;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class EmailMarketingBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $formIntegrationsProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handleIntegrations']
        );
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/EmailMarketing');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function handleIntegrations(ProcessSubmissionEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if (!$form->hasOptInPermission()) {
            return;
        }

        if ($form->isDisabled()->api) {
            return;
        }

        /** @var EmailMarketingIntegrationInterface[] $integrations */
        $integrations = $this->formIntegrationsProvider->getForForm($form, IntegrationInterface::TYPE_EMAIL_MARKETING);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            $client = $this->clientProvider->getAuthorizedClient($integration);
            $integration->push($form, $client);
        }
    }
}
