<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Notifications\NotificationFilesService;
use Solspace\Freeform\Services\SettingsService;

class NotificationsMigrator
{
    public function __construct(
        private FormsService $formsService,
        private SettingsService $settings,
        private NotificationFilesService $filesService,
    ) {
    }

    public function migrate(bool $removeDbNotifications = false): bool
    {
        $templateDir = $this->settings->getSettingsModel()->getAbsoluteEmailTemplateDirectory();

        if (!$templateDir) {
            return true;
        }

        $idToFilenameMap = [];

        $dbNotifications = NotificationRecord::find()->all();
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
    private function changeFormOccurrences(array $idToFilenameMap)
    {
        return;
        foreach ($this->getAllForms() as $form) {
            $json = json_decode($form->getLayoutAsJson());
            $hasChanges = false;
            foreach ($json->composer->properties as $key => $properties) {
                if ('admin_notifications' === $key) {
                    $notificationId = (int) ($properties->notificationId ?? 0);
                    if (isset($idToFilenameMap[$notificationId])) {
                        $json->composer->properties->admin_notifications->notificationId = $idToFilenameMap[$notificationId];
                        $hasChanges = true;
                    }

                    continue;
                }

                if (\in_array($properties->type, ['email'], true)) {
                    $notificationId = (int) ($properties->notificationId ?? null);
                    if (isset($idToFilenameMap[$notificationId])) {
                        $json->composer->properties->{$key}->notificationId = $idToFilenameMap[$notificationId];
                        $hasChanges = true;
                    }
                }
            }

            if ($hasChanges) {
                $form->layoutJson = json_encode($json);
                $this->formsService->save($form);
            }
        }
    }

    /**
     * @return Form[]
     */
    private function getAllForms(): array
    {
        return $this->formsService->getAllForms();
    }
}
