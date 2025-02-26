<?php

echo "Freeform: Unit Test Suite\n";

require_once __DIR__.'/../../../../vendor/autoload.php';

if (!class_exists(\Craft::class)) {
    class Craft
    {
        public static $container;
    }
}
