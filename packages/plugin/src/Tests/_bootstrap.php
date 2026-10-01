<?php

echo "Freeform: Unit Test Suite\n";

require_once __DIR__.'/../../../../vendor/autoload.php';

(new \CraftCms\Yii2Adapter\ClassAliases())->register();

if (!class_exists(Craft::class)) {
    class Craft
    {
        public static $app;

        public static $container;

        public static function error($message, $method = null): void
        {
            // Unit tests verify the failed operation's state directly.
        }

        public static function t($category, $string, $variables = [], $language = null)
        {
            return $string;
        }
    }
}

if (!class_exists(Yii::class)) {
    class Yii
    {
        public static $app = false;
    }
}
