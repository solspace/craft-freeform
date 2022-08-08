<?php

namespace Solspace\Freeform\Bundles\Integrations;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\FetchCrmTypesEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Services\CrmService;
use yii\base\Event;

class CrmIntegrations extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            CrmService::class,
            CrmService::EVENT_FETCH_TYPES,
            function (FetchCrmTypesEvent $event) {
                $freeformPath = \Craft::getAlias('@freeform');
                $classMap = ClassMapGenerator::createMap($freeformPath.'/Integrations/CRM/');

                foreach ($classMap as $class => $path) {
                    $reflectionClass = new \ReflectionClass($class);

                    if ($reflectionClass->isAbstract() || $reflectionClass->isInterface()) {
                        continue;
                    }

                    if (!$reflectionClass->implementsInterface(CRMIntegrationInterface::class)) {
                        continue;
                    }

                    $event->addType($class);
                }
            }
        );
    }
}
