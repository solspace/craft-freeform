<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use Solspace\Freeform\Services\Notifications\NotificationDatabaseService;
use yii\web\HttpException;
use yii\web\Response;

class DatabaseController extends AbstractNotificationsController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $this->view->registerAssetBundle(NotificationIndexBundle::class);

        $notifications = $this->getService()->getAll();

        return $this->renderTemplate(
            'freeform/notifications/database',
            [
                'notifications' => $notifications,
                'settings' => Freeform::getInstance()->settings->getSettingsModel(),
                'isFiles' => false,
                'type' => $this->getType(),
            ]
        );
    }

    public function actionCreate(): Response
    {
        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        $date = (new \DateTime())->format('Ymd-His');
        $name = "new-template-{$date}";

        $record = NotificationTemplateRecord::create();
        $record->name = "New Template on {$date}";
        $record->handle = $name;
        $record->fromEmail = $settingsModel->defaultFromEmail;
        $record->fromName = $settingsModel->defaultFromName;

        $title = Freeform::t('Create a new email notification template');

        return $this->renderEditForm($record, $title);
    }

    public function actionEdit(string $id): Response
    {
        $record = $this->getService()->getById($id);

        if (!$record) {
            throw new HttpException(
                404,
                Freeform::t('Notification with ID {id} not found', ['id' => $id])
            );
        }

        return $this->renderEditForm($record, $record->name);
    }

    public function actionDuplicate(): Response
    {
        $this->requirePostRequest();

        $id = $this->request->post('id');
        $notification = $this->getService()->getById($id);

        if (!$notification) {
            return $this->asJson(['success' => false, 'errors' => ['Notification doesn\'t exist']]);
        }

        $record = NotificationTemplateRecord::create();

        $record->setAttributes($notification->getAttributes(), false);
        $record->id = null;
        $record->dateCreated = null;
        $record->dateUpdated = null;
        $record->uid = null;

        while (true) {
            $handle = $record->handle;
            if (preg_match('/-(\d+)$/', $handle, $matches)) {
                $number = (int) $matches[1];
                $handle = preg_replace('/-\d+$/', '-'.($number + 1), $handle);
            } else {
                $handle .= '-1';
            }
            $record->handle = $handle;

            if (!NotificationTemplateRecord::findOne(['handle' => $handle])) {
                break;
            }
        }

        $record->save();

        return $this->asJson(['success' => true]);
    }

    protected function getNewOrExistingNotification(mixed $id): NotificationTemplateRecord
    {
        $record = $this->getService()->getById($id);
        if (!$record) {
            $record = NotificationTemplateRecord::create();
        }

        return $record;
    }

    protected function getType(): string
    {
        return 'database';
    }

    protected function getService(): NotificationDatabaseService
    {
        return \Craft::$container->get(NotificationDatabaseService::class);
    }
}
