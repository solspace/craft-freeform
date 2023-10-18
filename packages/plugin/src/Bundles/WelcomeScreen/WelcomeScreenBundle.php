<?php

namespace Solspace\Freeform\Bundles\WelcomeScreen;

use craft\events\PluginEvent;
use craft\helpers\UrlHelper;
use craft\services\Plugins;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class WelcomeScreenBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            [$this, 'redirectToWelcome']
        );
    }

    public function redirectToWelcome(PluginEvent $event): void
    {
        if (!$event->plugin instanceof Freeform) {
            return;
        }

        if (\Craft::$app->request->isCpRequest) {
            \Craft::$app->response->redirect(UrlHelper::cpUrl('freeform/welcome'))->send();
        }
    }
}
