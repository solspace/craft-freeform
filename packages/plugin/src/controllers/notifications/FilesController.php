<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use Solspace\Freeform\Services\Notifications\NotificationFilesService;
use yii\web\ForbiddenHttpException;
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
        if (!$this->isEditable()) {
            throw new ForbiddenHttpException(Freeform::t('Creating file based notification templates is prohibited'));
        }

        $date = (new \DateTime())->format('Ymd-His');
        $name = "new-template-{$date}";

        $record = $this->getService()->create($name);
        $record->name = "New Template on {$date}";
        $record->handle = $name;

        $title = Freeform::t('Create a new email notification template');

        return $this->renderEditForm($record, $title);
    }

    public function actionEdit(string $id): Response
    {
        if (!$this->isEditable()) {
            throw new ForbiddenHttpException(Freeform::t('Editing file based notifications is prohibited'));
        }

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
        if (!$this->isEditable()) {
            throw new ForbiddenHttpException(Freeform::t('Duplicating file based notifications is prohibited'));
        }

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

    public function actionDelete(): Response
    {
        if (!$this->isEditable()) {
            throw new ForbiddenHttpException(Freeform::t('Deleting file based notifications is prohibited'));
        }

        return parent::actionDelete();
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
        return 'files';
    }

    protected function getService(): NotificationFilesService
    {
        return \Craft::$container->get(NotificationFilesService::class);
    }

    private function isEditable(): bool
    {
        return $this->getSettingsService()->getSettingsModel()->allowFileTemplateEdit;
    }
}
