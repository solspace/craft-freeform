<?php

namespace Solspace\Freeform\Bundles\Widgets;

use craft\base\Widget;
use craft\events\RegisterComponentTypesEvent;
use craft\services\Dashboard;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;
use Solspace\Freeform\Widgets\ExtraWidgetInterface;
use yii\base\Event;

class WidgetsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Dashboard::class,
            Dashboard::EVENT_REGISTER_WIDGET_TYPES,
            function (RegisterComponentTypesEvent $event) {
                if (!PermissionHelper::checkPermission('accessPlugin-freeform')) {
                    return;
                }

                $freeformPath = \Craft::getAlias('@freeform');
                $classMap = ClassMapHelper::getMap($freeformPath.'/Widgets');

                $isPro = Freeform::getInstance()->isPro();

                foreach ($classMap as $class => $path) {
                    $reflectionClass = new \ReflectionClass($class);

                    if (
                        !$reflectionClass->isSubclassOf(Widget::class)
                        || $reflectionClass->isAbstract()
                        || $reflectionClass->isInterface()
                    ) {
                        continue;
                    }

                    if (!$isPro && $reflectionClass->implementsInterface(ExtraWidgetInterface::class)) {
                        continue;
                    }

                    $event->types[] = $class;
                }
            }
        );
    }
}
