<?php

namespace Solspace\Freeform\Bundles\Feed;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;

class FeedBundle extends FeatureBundle
{
    public function __construct()
    {
        $freeform = Freeform::getInstance();
        $freeform->feed->fetchFeed();
    }
}
