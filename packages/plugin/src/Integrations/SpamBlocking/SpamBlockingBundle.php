<?php

namespace Solspace\Freeform\Integrations\SpamBlocking;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class SpamBlockingBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
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
        $settings = $this->plugin()->settings->getSettingsModel();
        $isDisplayErrors = $this->plugin()->settings->isSpamBehaviorDisplayErrors();

        if ($settings->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        $integrations = $this->integrationsProvider->getForForm($form, SpamBlockingIntegrationInterface::class);
        foreach ($integrations as $integration) {
            $integration->validate($form, $isDisplayErrors);
        }
    }
}
