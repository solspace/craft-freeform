<?php

echo "Freeform: Unit Test Suite\n";

require_once __DIR__.'/../../../../vendor/autoload.php';

if (!class_exists(Craft::class)) {
    class Craft
    {
        public static $app;

        public static $container;

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
