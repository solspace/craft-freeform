<?php

namespace Solspace\Freeform\Bundles\GarbageCollection;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\PurgeNotificationLogsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Application;
use yii\base\Event;

class PurgeNotificationLogs extends FeatureBundle
{
    private const CACHE_KEY = 'freeform-purge-notification-logs';
    private const CACHE_TTL = 60 * 60; // 1h

    public function __construct(private FreeformQueueHandler $queueHandler)
    {
        if (\Craft::$app->request->isConsoleRequest) {
            return;
        }

        Event::on(
            Application::class,
            Application::EVENT_AFTER_REQUEST,
            [$this, 'removeNotificationLogs']
        );
    }

    public function removeNotificationLogs(): void
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        if (Freeform::isLocked(self::CACHE_KEY, self::CACHE_TTL)) {
            return;
        }

        $this->queueHandler->queueSingleJobInstance(new PurgeNotificationLogsJob());
    }
}
