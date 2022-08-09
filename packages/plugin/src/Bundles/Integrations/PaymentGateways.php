<?php

namespace Solspace\Freeform\Bundles\Integrations;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Events\Integrations\FetchPaymentGatewayTypesEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Services\PaymentGatewaysService;
use yii\base\Event;

class PaymentGateways extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            PaymentGatewaysService::class,
            PaymentGatewaysService::EVENT_FETCH_TYPES,
            function (FetchPaymentGatewayTypesEvent $event) {
                $freeformPath = \Craft::getAlias('@freeform');
                $classMap = ClassMapGenerator::createMap($freeformPath.'/Integrations/PaymentGateways/');

                foreach ($classMap as $class => $path) {
                    $reflectionClass = new \ReflectionClass($class);

                    if ($reflectionClass->isAbstract() || $reflectionClass->isInterface()) {
                        continue;
                    }

                    if (!$reflectionClass->implementsInterface(PaymentGatewayIntegrationInterface::class)) {
                        continue;
                    }

                    $event->addType($class);
                }
            }
        );
    }
}
