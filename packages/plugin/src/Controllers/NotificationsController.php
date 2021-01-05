<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use Solspace\Freeform\Services\NotificationsService;
use yii\base\InvalidParamException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;

class NotificationsController extends BaseController
{
    /**
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     */
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $this->view->registerAssetBundle(NotificationIndexBundle::class);
        $notifications = $this->getNotificationService()->getAllNotifications();

        return $this->renderTemplate(
            'freeform/notifications',
            [
                'notifications' => $notifications,
                'settings' => Freeform::getInstance()->settings->getSettingsModel(),
            ]
        );
    }

    /**
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws HttpException
     */
    public function actionCreate(): Response
    {
        $record = NotificationRecord::create();
        $title = Freeform::t('Create a new email notification template');

        return $this->renderEditForm($record, $title);
    }

    /**
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws HttpException
     */
    public function actionEdit(int $id): Response
    {
        $record = $this->getNotificationService()->getNotificationById($id);

        if (!$record) {
            throw new HttpException(
                404,
                Freeform::t('Notification with ID {id} not found', ['id' => $id])
            );
        }

        return $this->renderEditForm($record, $record->name);
    }

    /**
     * @throws ForbiddenHttpException
     * @throws FreeformException
     * @throws \Exception
     * @throws \yii\web\BadRequestHttpException
     */
    public function actionSave()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $request = \Craft::$app->request;
        $post = $request->post();

        $notificationId = $post['notificationId'] ?? null;
        $notification = $this->getNewOrExistingNotification((int) $notificationId);

        $notification->name = $request->post('name');
        $notification->handle = $request->post('handle');
        $notification->description = $request->post('description');
        $notification->fromEmail = $request->post('fromEmail');
        $notification->fromName = $request->post('fromName');
        $notification->cc = $request->post('cc');
        $notification->bcc = $request->post('bcc');
        $notification->subject = $request->post('subject');
        $notification->replyToName = $request->post('replyToName');
        $notification->replyToEmail = $request->post('replyToEmail');
        $notification->bodyHtml = $request->post('bodyHtml');
        $notification->bodyText = $request->post('bodyText');
        $notification->autoText = (bool) $request->post('autoText');
        $notification->includeAttachments = (bool) $request->post('includeAttachments');
        $notification->presetAssets = $request->post('presetAssets');

        if ($this->getNotificationService()->save($notification)) {
            // Return JSON response if the request is an AJAX request
            if ($request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Notification saved'));
            \Craft::$app->session->setFlash(Freeform::t('Notification saved'), true);

            return $this->redirectToPostedUrl($notification);
        }

        // Return JSON response if the request is an AJAX request
        if ($request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Notification not saved'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(
            [
                'notification' => $notification,
                'errors' => $notification->getErrors(),
            ]
        );
    }

    public function actionDuplicate(): Response
    {
        $this->requirePostRequest();

        $id = $this->request->post('id');
        $notification = NotificationRecord::findOne(['id' => $id]);

        if (!$notification) {
            return $this->asJson(['success' => false, 'errors' => ['Notification doesn\'t exist']]);
        }

        $record = new NotificationRecord();

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

            if (!NotificationRecord::findOne(['handle' => $handle])) {
                break;
            }
        }

        $record->save();

        return $this->asJson(['success' => true]);
    }

    /**
     * Deletes a notification.
     *
     * @throws \yii\web\BadRequestHttpException
     * @throws ForbiddenHttpException
     * @throws \Exception
     */
    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $id = \Craft::$app->request->post('id');
        $this->getNotificationService()->deleteById($id);

        return $this->asJson(['success' => true]);
    }

    /**
     * @throws InvalidParamException
     * @throws ForbiddenHttpException
     */
    private function renderEditForm(NotificationRecord $record, string $title): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $this->view->registerAssetBundle(NotificationEditorBundle::class);

        $variables = [
            'notification' => $record,
            'title' => $title,
            'continueEditingUrl' => 'freeform/notifications/{id}',
        ];

        return $this->renderTemplate('freeform/notifications/edit', $variables);
    }

    private function getNotificationService(): NotificationsService
    {
        return Freeform::getInstance()->notifications;
    }

    /**
     * @throws FreeformException
     */
    private function getNewOrExistingNotification(int $id): NotificationRecord
    {
        if ($id) {
            $notification = $this->getNotificationService()->getNotificationById($id);

            if (!$notification) {
                throw new FreeformException(Freeform::t('Notification with ID {id} not found', ['id' => $id]));
            }
        } else {
            $notification = NotificationRecord::create();
        }

        return $notification;
    }
}
