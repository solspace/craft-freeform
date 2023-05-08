<?php

namespace Solspace\Freeform\Bundles\Migrations\Notifications;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Models\FormModel;
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

        $idToFilenameMap = [];

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

            $idToFilenameMap[(int) $notification->id] = $file->filepath;

            if ($removeDbNotifications) {
                $notification->delete();
            }
        }

        $this->changeFormOccurrences($idToFilenameMap);

        if ($removeDbNotifications) {
            Freeform::getInstance()->settings->saveSettings(['emailTemplateStorage' => 'template']);
        }

        return true;
    }

    private function changeFormOccurrences(array $idToFilenameMap)
    {
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

                if (\in_array($properties->type, ['email', 'dynamic_recipients'], true)) {
                    $notificationId = (int) ($properties->notificationId ?? null);
                    if (isset($idToFilenameMap[$notificationId])) {
                        $json->composer->properties->{$key}->notificationId = $idToFilenameMap[$notificationId];
                        $hasChanges = true;
                    }
                }
            }

            if ($hasChanges) {
                $form->layoutJson = json_encode($json);
                Freeform::getInstance()->forms->save($form);
            }
        }
    }

    /**
     * @return FormModel[]
     *
     * @throws ComposerException
     */
    private function getAllForms(): array
    {
        return Freeform::getInstance()->forms->getAllForms();
    }
}
