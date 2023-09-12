<?php

namespace Solspace\Freeform\Integrations\Captchas;

use Composer\ClassMapGenerator\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CaptchasBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
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
}
