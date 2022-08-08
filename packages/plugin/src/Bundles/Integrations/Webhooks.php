<?php

namespace Solspace\Freeform\Bundles\Integrations;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\FetchWebhookTypesEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Webhooks\WebhookInterface;
use Solspace\Freeform\Services\Pro\WebhooksService;
use yii\base\Event;

class Webhooks extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            WebhooksService::class,
            WebhooksService::EVENT_FETCH_TYPES,
            function (FetchWebhookTypesEvent $event) {
                $freeformPath = \Craft::getAlias('@freeform');
                $classMap = ClassMapGenerator::createMap($freeformPath.'/Webhooks/Integrations/');

                foreach ($classMap as $class => $path) {
                    $reflectionClass = new \ReflectionClass($class);

                    if ($reflectionClass->isAbstract() || $reflectionClass->isInterface()) {
                        continue;
                    }

                    if (!$reflectionClass->implementsInterface(WebhookInterface::class)) {
                        continue;
                    }

                    $event->addType($class);
                }
            }
        );
    }
}
