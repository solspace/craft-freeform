<?php

namespace Solspace\Freeform\Bundles\GarbageCollection;

use craft\services\Gc;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\QueuedFormGenerationService;
use yii\base\Event;

class FormGenerationGarbageCollector extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Gc::class, Gc::EVENT_RUN, static function () {
            \Craft::$container->get(QueuedFormGenerationService::class)->prune();
        });
    }
}
