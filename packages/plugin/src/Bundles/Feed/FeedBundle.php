<?php

namespace Solspace\Freeform\Bundles\Feed;

use Solspace\Freeform\Library\Bundles\FeatureBundle;

class FeedBundle extends FeatureBundle
{
    public function __construct()
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsConsoleRequest() || !$request->getIsCpRequest()) {
            return;
        }

        $this->plugin()->feed->fetchFeed();
    }
}
