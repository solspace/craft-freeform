<?php

namespace Solspace\Freeform\controllers\Pro;

use craft\helpers\UrlHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Solspace\Freeform\Resources\Bundles\ExportProfileBundle;
use Solspace\Freeform\Resources\Bundles\SettingsBundle;
use yii\web\HttpException;
use yii\web\Response;

class ExportNotificationsController extends BaseController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS);
        $this->view->registerAssetBundle(SettingsBundle::class);

        $notifications = $this->getExportNotificationsService()->getAll();

        return $this->renderTemplate(
            'freeform/export/notifications',
            ['exportNotifications' => $notifications]
        );
    }

    public function actionCreate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_MANAGE);

        $notification = new ExportNotificationRecord();

        return $this->renderEditForm($notification, Freeform::t('Create a new Export Profile'));
    }

    public function actionEdit(int $id): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_MANAGE);

        $notification = $this->getExportNotificationsService()->getById($id);

        if (!$notification) {
            throw new HttpException(
                404,
                Freeform::t('Notification with ID {id} not found'),
                ['id' => $id]
            );
        }

        return $this->renderEditForm($notification, $notification->name);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_MANAGE);

        $post = \Craft::$app->request->post();
        $post['recipients'] = StringHelper::extractSeparatedValues($post['recipients']);
        $post['recipients'] = json_encode($post['recipients']);

        $id = \Craft::$app->request->post('notificationId');
        $record = $this->getNewOrExistingNotification($id);

        $record->setAttributes($post);

        if ($this->getExportNotificationsService()->save($record)) {
            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Notification saved'));
            \Craft::$app->session->setFlash(Freeform::t('Notification saved'));

            return $this->redirectToPostedUrl($record);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Notification not saved'));

        return $this->renderEditForm($record, $record->name);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_MANAGE);

        $id = \Craft::$app->request->post('id');

        $this->getExportNotificationsService()->deleteById($id);

        return $this->asJson(['success' => true]);
    }

    private function renderEditForm(ExportNotificationRecord $record, string $title): Response
    {
        $this->view->registerAssetBundle(ExportProfileBundle::class);

        return $this->renderTemplate(
            'freeform/export/notifications/edit',
            [
                'notification' => $record,
                'title' => $title,
                'continueEditingUrl' => 'freeform/export/notifications/{id}',
                'crumbs' => [
                    ['label' => 'Freeform', 'url' => UrlHelper::cpUrl('freeform')],
                    [
                        'label' => Freeform::t('Export Notifications'),
                        'url' => UrlHelper::cpUrl('freeform/export/notifications'),
                    ],
                ],
            ]
        );
    }

    private function getNewOrExistingNotification(int $id = null): ExportNotificationRecord
    {
        $record = $this->getExportNotificationsService()->getById($id);
        if (!$record) {
            $record = new ExportNotificationRecord();
        }

        return $record;
    }
}
