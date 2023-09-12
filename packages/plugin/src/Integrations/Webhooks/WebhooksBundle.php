<?php

namespace Solspace\Freeform\Integrations\Webhooks;

use Composer\ClassMapGenerator\ClassMapGenerator;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Webhooks\WebhookIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class WebhooksBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $formIntegrationsProvider,
    ) {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Form::class,
            Form::EVENT_AFTER_SUBMIT,
            [$this, 'triggerWebhooks']
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/Webhooks');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function triggerWebhooks(SubmitEvent $event): void
    {
        $form = $event->getForm();

        /** @var WebhookIntegrationInterface[] $webhooks */
        $webhooks = $this->formIntegrationsProvider->getForForm(
            $form,
            IntegrationInterface::TYPE_WEBHOOKS
        );

        foreach ($webhooks as $webhook) {
            if (!$webhook->isEnabled()) {
                continue;
            }

            $webhook->trigger($form);
        }
    }
}
