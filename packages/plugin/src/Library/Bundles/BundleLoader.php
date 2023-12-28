<?php

namespace Solspace\Freeform\Library\Bundles;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\ClassMapHelper;

class BundleLoader
{
    public static function loadBundles(string $path): void
    {
        static $initialized = [];

        if (isset($initialized[$path])) {
            return;
        }

        $classMap = ClassMapHelper::getMap($path);

        /** @var \ReflectionClass[][] $loadableClasses */
        $loadableClasses = [];

        /** @var BundleInterface $class */
        foreach ($classMap as $class => $path) {
            $reflectionClass = new \ReflectionClass($class);
            if (
                $reflectionClass->implementsInterface(BundleInterface::class)
                && !$reflectionClass->isAbstract()
                && !$reflectionClass->isInterface()
            ) {
                if ($class::isProOnly() && !Freeform::getInstance()->isPro()) {
                    continue;
                }

                $priority = $class::getPriority();
                $loadableClasses[$priority][] = $class;
            }
        }

        ksort($loadableClasses, \SORT_NUMERIC);

        foreach ($loadableClasses as $classes) {
            foreach ($classes as $class) {
                \Craft::$container->set($class);
            }
        }

        foreach ($loadableClasses as $classes) {
            foreach ($classes as $class) {
                \Craft::$container->get($class);
            }
        }

        $initialized[$path] = true;
    }
}
