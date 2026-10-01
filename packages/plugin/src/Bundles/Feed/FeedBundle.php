<?php

namespace Solspace\Freeform\Bundles\Feed;

use craft\web\Application;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FeedBundle extends FeatureBundle
{
    public function __construct()
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsConsoleRequest() || !$this->plugin()->isInstalled) {
            return;
        }

        if ($request->getIsCpRequest()) {
            $this->plugin()->feed->fetchFeed();

            return;
        }

        // Enqueue before response preparation so Craft can start its automatic queue runner.
        Event::on(Application::class, Application::EVENT_AFTER_REQUEST, [$this, 'queueFeedRefresh']);
    }

    public function queueFeedRefresh(): void
    {
        $this->plugin()->feed->queueFeedRefresh();
    }
}
