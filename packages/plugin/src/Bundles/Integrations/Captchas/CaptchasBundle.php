<?php

namespace Solspace\Freeform\Bundles\Integrations\Captchas;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CaptchasBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $formIntegrationsProvider,
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
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'handleIntegrations']
        );
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/Captchas');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function handleIntegrations(ValidationEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();

        /** @var CaptchaIntegrationInterface[] $integrations */
        $integrations = $this->formIntegrationsProvider->getForForm($form, IntegrationInterface::TYPE_CAPTCHAS);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            if (!$integration->validate($form)) {
                $form->addError($integration->getErrorMessage());
            }
        }
    }
}
