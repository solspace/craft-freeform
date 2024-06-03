<?php

namespace Solspace\Freeform\Integrations\EmailMarketing;

use craft\helpers\Queue;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Jobs\ProcessEmailMarketingIntegrationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class EmailMarketingBundle extends FeatureBundle
{
    public function __construct()
    {
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

    public static function isProOnly(): bool
    {
        return true;
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/EmailMarketing');

        $classMap = ClassMapHelper::getMap($path);
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

        if (!$this->plugin()->integrations->hasIntegrations($form, EmailMarketingIntegrationInterface::class)) {
            return;
        }

        if ($form->isDisabled()->api) {
            return;
        }

        if ($this->plugin()->settings->getSettingsModel()->useQueueForIntegrations) {
            Queue::push(new ProcessEmailMarketingIntegrationsJob(['formId' => $form->getId()]));
        } else {
            $this->plugin()->integrations->processIntegrations($form, EmailMarketingIntegrationInterface::class);
        }
    }
}
