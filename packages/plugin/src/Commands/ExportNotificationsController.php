<?php

namespace Solspace\Freeform\Commands;

use Solspace\Freeform\Bundles\Notifications\Export\ExportNotifications;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use yii\console\ExitCode;

class ExportNotificationsController extends BaseCommand
{
    /**
     * Processes enabled export notifications that are due.
     *
     * Configure this command to run every minute so custom cron schedules are
     * evaluated at their requested time:
     *
     * * * * * php /path/to/craft freeform/export-notifications/run
     */
    public function actionRun(): int
    {
        $this->getHandler()->handleNotificationsWithCustomCronSchedule();

        return ExitCode::OK;
    }

    private function getHandler(): ExportNotifications
    {
        return new ExportNotifications(\Craft::$container->get(NotificationLoggerProvider::class));
    }
}
