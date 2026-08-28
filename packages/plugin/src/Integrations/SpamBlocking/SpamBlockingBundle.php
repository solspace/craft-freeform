<?php

namespace Solspace\Freeform\Integrations\SpamBlocking;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\FormMonitor\Providers\FormMonitorProvider;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\ProcessSpamValidationJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\AsyncSpamBlockingIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class SpamBlockingBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private FreeformQueueHandler $queueHandler,
    ) {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validate'],
        );

        Event::on(
            Form::class,
            Form::EVENT_AFTER_SUBMIT,
            [$this, 'validateAsync'],
        );
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/SpamBlocking');

        $classMap = ClassMapHelper::getMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function validate(ValidationEvent $event): void
    {
        $form = $event->getForm();
        $settings = $this->plugin()->settings;
        $isDisplayErrors = $settings->isSpamBehaviorDisplayErrors();

        if ($settings->isBypassSpamCheckOnLoggedInUsers() && \Craft::$app->getUser()->id) {
            return;
        }

        $integrations = $this
            ->integrationsProvider
            ->getForForm(
                $form,
                SpamBlockingIntegrationInterface::class,
                filter: static fn ($integration) => !$integration instanceof AsyncSpamBlockingIntegrationInterface
            )
        ;

        foreach ($integrations as $integration) {
            $integration->validate($form, $isDisplayErrors);
        }
    }

    public function validateAsync(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $settings = $this->plugin()->settings;
        $isQueueEnabled = $settings->isAiFieldQueueEnabled();

        if (!$this->integrationsProvider->hasAsyncSpamBlocking($form)) {
            return;
        }

        $formMonitorProvider = \Craft::$container->get(FormMonitorProvider::class);
        if ($formMonitorProvider->isRequestFromFormMonitor($form)) {
            return;
        }

        if ($settings->isBypassSpamCheckOnLoggedInUsers() && \Craft::$app->getUser()->id) {
            return;
        }

        if ($form->isMarkedAsSpam()) {
            return;
        }

        // Store-data-off path already ran AI inline in handleSubmission.
        if ($form->isAsyncSpamValidated()) {
            return;
        }

        $submission = $form->getSubmission();
        if (!$submission?->id) {
            return;
        }

        $settingsPriority = $this->plugin()->settings->getQueuePriority();
        if (null !== $settingsPriority) {
            $priority = $settingsPriority - 10;
        } else {
            $priority = 200;
        }

        $job = new ProcessSpamValidationJob([
            'formId' => $form->getId(),
            'submissionId' => $submission->getId(),
            'postedData' => $submission->getFormFieldValues(),
            'displayErrors' => false,
        ]);

        $this->queueHandler->queueJob($job, $priority, $isQueueEnabled);
    }
}
