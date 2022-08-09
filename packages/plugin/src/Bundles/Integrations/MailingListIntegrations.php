<?php

namespace Solspace\Freeform\Bundles\Integrations;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\MailingLists\MailingListIntegrationInterface;
use Solspace\Freeform\Services\MailingListsService;
use yii\base\Event;

class MailingListIntegrations extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            MailingListsService::class,
            MailingListsService::EVENT_FETCH_TYPES,
            function (FetchMailingListTypesEvent $event) {
                $freeformPath = \Craft::getAlias('@freeform');
                $classMap = ClassMapGenerator::createMap($freeformPath.'/Integrations/MailingLists/');

                foreach ($classMap as $class => $path) {
                    $reflectionClass = new \ReflectionClass($class);

                    if ($reflectionClass->isAbstract() || $reflectionClass->isInterface()) {
                        continue;
                    }

                    if (!$reflectionClass->implementsInterface(MailingListIntegrationInterface::class)) {
                        continue;
                    }

                    $event->addType($class);
                }
            }
        );
    }
}
