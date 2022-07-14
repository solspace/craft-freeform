<?php

namespace Solspace\Freeform\Controllers\notifications;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use Solspace\Freeform\Services\Notifications\NotificationFilesService;
use yii\web\HttpException;
use yii\web\Response;

class FilesController extends AbstractNotificationsController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $this->view->registerAssetBundle(NotificationIndexBundle::class);

        $notificationFilesService = \Craft::$container->get(NotificationFilesService::class);

        $notifications = $notificationFilesService->getAll(true);

        return $this->renderTemplate(
            'freeform/notifications/files',
            [
                'notifications' => $notifications,
                'settings' => Freeform::getInstance()->settings->getSettingsModel(),
                'isFiles' => true,
                'type' => $this->getType(),
            ]
        );
    }

    public function actionCreate(): Response
    {
        $date = (new \DateTime())->format('Y-m-d');
        $name = "new-template-{$date}";

        $record = $this->getService()->create($name);
        $record->name = "New Template on {$date}";
        $record->handle = $name;

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

        $emailDirectory = $this->getSettingsService()->getSettingsModel()->getAbsoluteEmailTemplateDirectory();
        $original = $emailDirectory.'/'.$notification->filepath;
        $new = $emailDirectory.'/'.$notification->handle.'-copy.twig';
        copy($original, $new);

        return $this->asJson(['success' => true]);
    }

    protected function getNewOrExistingNotification(mixed $id): NotificationRecord
    {
        $record = $this->getService()->getById($id);
        if (!$record) {
            $record = NotificationRecord::create();
        }

        return $record;
    }

    protected function getType(): string
    {
        return 'files';
    }

    protected function getService(): NotificationFilesService
    {
        return \Craft::$container->get(NotificationFilesService::class);
    }
}
