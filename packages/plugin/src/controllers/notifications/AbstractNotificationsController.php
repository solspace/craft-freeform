<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use Solspace\Freeform\Services\Notifications\NotificationsServiceInterface;
use yii\web\Response;

abstract class AbstractNotificationsController extends BaseController
{
    abstract public function actionIndex(): Response;

    public function actionSave(): ?Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $request = \Craft::$app->request;
        $post = $request->post();

        $notificationId = $post['notificationId'] ?? null;
        $notification = $this->getService()->getById($notificationId) ?? NotificationTemplateRecord::create();

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

        if ($this->getService()->save($notification)) {
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

        return null;
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $id = \Craft::$app->request->post('id');

        return $this->asJson(['success' => $this->getService()->delete($id)]);
    }

    public function actionRedirectToNav(): Response
    {
        $storageType = Freeform::getInstance()->settings->getSettingsModel()->emailTemplateStorageType;

        return match ($storageType) {
            Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE => $this->redirect('freeform/notifications/database'),
            default => $this->redirect('freeform/notifications/files'),
        };
    }

    abstract protected function getType(): string;

    abstract protected function getNewOrExistingNotification(mixed $id): NotificationTemplateRecord;

    abstract protected function getService(): NotificationsServiceInterface;

    protected function renderEditForm(
        NotificationTemplateRecord $record,
        string $title
    ): Response {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $this->view->registerAssetBundle(NotificationEditorBundle::class);

        $variables = [
            'notification' => $record,
            'title' => $title,
            'type' => $this->getType(),
        ];

        return $this->renderTemplate('freeform/notifications/edit', $variables);
    }
}
