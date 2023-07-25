<?php

namespace Solspace\Freeform\Bundles\Integrations\CRM;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\FetchCrmTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Services\Integrations\CrmService;
use yii\base\Event;

class CrmBundle extends FeatureBundle
{
    public function __construct(private FormIntegrationsProvider $formIntegrationsProvider)
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            CrmService::class,
            CrmService::EVENT_FETCH_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handleIntegrations']
        );
    }

    public function registerTypes(FetchCrmTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/CRM');

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

        /** @var CRMIntegrationInterface[] $integrations */
        $integrations = $this->formIntegrationsProvider->getForForm($form, IntegrationInterface::TYPE_CRM);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            $integration->push($form);
        }
    }
}
