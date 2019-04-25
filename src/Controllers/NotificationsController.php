<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use craft\helpers\UrlHelper;
use craft\web\Controller;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use Solspace\Freeform\Services\NotificationsService;
use yii\base\InvalidParamException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;

class NotificationsController extends BaseController
{
    /**
     * @return Response
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     */
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $notifications = $this->getNotificationService()->getAllNotifications();

        return $this->renderTemplate(
            'freeform/notifications',
            [
                'notifications' => $notifications,
                'settings'      => Freeform::getInstance()->settings->getSettingsModel(),
            ]
        );
    }

    /**
     * @return Response
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws HttpException
     */
    public function actionCreate(): Response
    {
        $record = NotificationRecord::create();
        $title  = Freeform::t('Create a new email notification template');

        return $this->renderEditForm($record, $title);
    }

    /**
     * @param int $id
     *
     * @return Response
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
     * @param NotificationRecord $record
     * @param string             $title
     *
     * @return Response
     * @throws InvalidParamException
     * @throws ForbiddenHttpException
     */
    private function renderEditForm(NotificationRecord $record, string $title): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);
        $routeParams = \Craft::$app->urlManager->getRouteParams();

        if (isset($routeParams['errors'])) {
            $record->addErrors($routeParams['errors']);
        }

        $this->view->registerAssetBundle(NotificationEditorBundle::class);

        $variables = [
            'notification'       => $record,
            'title'              => $title,
            'continueEditingUrl' => 'freeform/notifications/{id}',
        ];

        return $this->renderTemplate('freeform/notifications/edit', $variables);
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

        $post = \Craft::$app->request->post();

        $notificationId = $post['notificationId'] ?? null;
        $notification   = $this->getNewOrExistingNotification((int) $notificationId);

        $notification->name               = \Craft::$app->request->post('name');
        $notification->handle             = \Craft::$app->request->post('handle');
        $notification->description        = \Craft::$app->request->post('description');
        $notification->fromEmail          = \Craft::$app->request->post('fromEmail');
        $notification->fromName           = \Craft::$app->request->post('fromName');
        $notification->subject            = \Craft::$app->request->post('subject');
        $notification->replyToEmail       = \Craft::$app->request->post('replyToEmail');
        $notification->bodyHtml           = \Craft::$app->request->post('bodyHtml');
        $notification->bodyText           = \Craft::$app->request->post('bodyHtml');
        $notification->includeAttachments = (bool) \Craft::$app->request->post('includeAttachments');

        if ($this->getNotificationService()->save($notification)) {
            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Notification saved'));
            \Craft::$app->session->setFlash(Freeform::t('Notification saved'), true);

            return $this->redirectToPostedUrl($notification);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Notification not saved'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(
            [
                'notification' => $notification,
                'errors'       => $notification->getErrors(),
            ]
        );
    }

    /**
     * Deletes a notification
     *
     * @return Response
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
     * @return NotificationsService
     */
    private function getNotificationService(): NotificationsService
    {
        return Freeform::getInstance()->notifications;
    }

    /**
     * @param int $id
     *
     * @return NotificationRecord
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
