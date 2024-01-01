<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\Notifications\NotificationFilesService;
use Solspace\Freeform\Services\SettingsService;

class NotificationsMigrator
{
    public function __construct(
        private SettingsService $settings,
        private NotificationFilesService $filesService,
    ) {}

    public function migrate(bool $removeDbNotifications = false): bool
    {
        $templateDir = $this->settings->getSettingsModel()->getAbsoluteEmailTemplateDirectory();

        if (!$templateDir) {
            return true;
        }

        $idToFilenameMap = [];

        $dbNotifications = NotificationTemplateRecord::find()->all();
        foreach ($dbNotifications as $notification) {
            if ($notification->isFileBasedTemplate()) {
                continue;
            }

            $attributes = $notification->getAttributes();
            unset($attributes['id']);

            $file = new NotificationTemplateRecord();
            $file->filepath = $notification->handle.'.twig';
            $file->setAttributes($attributes, false);

            touch($templateDir.'/'.$file->filepath);
            $this->filesService->save($file);

            $idToFilenameMap[(int) $notification->id] = $file->filepath;

            if ($removeDbNotifications) {
                $notification->delete();
            }
        }

        $this->changeFormOccurrences($idToFilenameMap);

        if ($removeDbNotifications) {
            $this->settings->saveSettings(['emailTemplateStorage' => 'template']);
        }

        return true;
    }

    // TODO: update this to use the new tables instead of old layout JSON
    private function changeFormOccurrences(array $idToFilenameMap) {}
}
