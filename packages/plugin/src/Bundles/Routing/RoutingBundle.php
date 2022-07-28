<?php

namespace Solspace\Freeform\Bundles\Routing;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Symfony\Component\Finder\Finder;
use yii\base\Event;

class RoutingBundle extends FeatureBundle
{
    public function __construct(private Finder $finder)
    {
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            fn (RegisterUrlRulesEvent $event) => $this->registerRoutesIn(__DIR__.'/routes/cp', $event)
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            fn (RegisterUrlRulesEvent $event) => $this->registerRoutesIn(__DIR__.'/routes/site', $event)
        );
    }

    private function registerRoutesIn(string $directory, RegisterUrlRulesEvent $event)
    {
        $routeFiles = $this->finder
            ->files()
            ->ignoreDotFiles(true)
            ->name('*.php')
            ->in($directory)
        ;

        foreach ($routeFiles as $file) {
            $routes = include $file;
            $event->rules = array_merge($event->rules, $routes);
        }
    }
}
