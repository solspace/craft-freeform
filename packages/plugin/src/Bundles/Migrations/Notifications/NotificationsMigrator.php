<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\SettingsService;

class NotificationsMigrator
{
    private $settings;

    private $notifications;

    public function __construct(SettingsService $settings, NotificationsService $notifications)
    {
        $this->settings = $settings;
        $this->notifications = $notifications;
    }

    public function migrate(bool $removeDbNotifications = false): bool
    {
        $templateDir = $this->settings->getSettingsModel()->getAbsoluteEmailTemplateDirectory();

        if (!$templateDir) {
            return true;
        }

        $dbNotifications = $this->notifications->getAllNotifications();
        foreach ($dbNotifications as $notification) {
            if ($notification->isFileBasedTemplate()) {
                continue;
            }

            $attributes = $notification->getAttributes();
            unset($attributes['id']);

            $file = new NotificationRecord();
            $file->filepath = $notification->handle.'.twig';
            $file->setAttributes($attributes, false);

            touch($templateDir.'/'.$file->filepath);
            $this->notifications->saveNotificationAsFile($file);

            if ($removeDbNotifications) {
                $notification->delete();
            }
        }

        return true;
    }
}
