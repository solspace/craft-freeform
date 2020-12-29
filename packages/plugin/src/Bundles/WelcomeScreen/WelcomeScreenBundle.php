<?php

namespace Solspace\Freeform\Bundles\WelcomeScreen;

use craft\events\PluginEvent;
use craft\helpers\UrlHelper;
use craft\services\Plugins;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use yii\base\Event;

class WelcomeScreenBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            [$this, 'redirectToWelcome']
        );
    }

    public function redirectToWelcome(PluginEvent $event)
    {
        if (!$event->plugin instanceof Freeform) {
            return;
        }

        if (\Craft::$app->request->isCpRequest) {
            \Craft::$app->response->redirect(UrlHelper::cpUrl('freeform/welcome'))->send();
        }
    }
}
