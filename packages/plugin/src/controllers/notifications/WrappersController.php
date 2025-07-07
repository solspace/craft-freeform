<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class WrappersController extends BaseController
{
    public function actionIndex(): Response
    {
        $this->view->registerAssetBundle(NotificationIndexBundle::class);

        return $this->renderTemplate('freeform/notifications/wrappers', [
            'list' => NotificationWrapperRecord::find()->all(),
        ]);
    }

    public function actionCreate(): Response
    {
        $record = new NotificationWrapperRecord();
        $record->content = <<<'EOT'
            <html lang="en">
                <head></head>
                <body>
                    {{ emailBody }}
                </body>
            </html>
            EOT;

        return $this->renderEditForm($record, Freeform::t('New Wrapper'));
    }

    public function actionEdit(int $id): Response
    {
        $record = NotificationWrapperRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('Notification wrapper not found');
        }

        return $this->renderEditForm($record, $record->name);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();

        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $request = \Craft::$app->request;
        $id = $request->post('id');

        $record = NotificationWrapperRecord::findOne(['id' => $id]);
        $record?->delete();

        return $this->asJson(['success' => true]);
    }

    public function actionDuplicate(): Response
    {
        $this->requirePostRequest();

        $id = $this->request->post('id');
        $record = NotificationWrapperRecord::findOne(['id' => $id]);
        if (!$record) {
            return $this->asJson(['success' => false, 'errors' => ['Wrapper doesn\'t exist']]);
        }

        $clone = new NotificationWrapperRecord();

        $clone->setAttributes($record->getAttributes(), false);
        $clone->id = null;
        $clone->dateCreated = null;
        $clone->dateUpdated = null;
        $clone->uid = null;

        while (true) {
            $handle = $clone->handle;
            if (preg_match('/-(\d+)$/', $handle, $matches)) {
                $number = (int) $matches[1];
                $handle = preg_replace('/-\d+$/', '-'.($number + 1), $handle);
            } else {
                $handle .= '-1';
            }

            $clone->handle = $handle;

            if (!NotificationWrapperRecord::findOne(['handle' => $handle])) {
                break;
            }
        }

        $clone->save();

        return $this->asJson(['success' => true]);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $request = \Craft::$app->request;
        $post = $request->post();

        $id = $post['id'] ?? null;
        $record = NotificationWrapperRecord::findOne(['id' => $id]);
        if (!$record) {
            $record = new NotificationWrapperRecord();
        }

        $record->setAttributes($post);

        if (Freeform::getInstance()->notificationWrappers->save($record)) {
            // Return JSON response if the request is an AJAX request
            if ($request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setSuccess(Freeform::t('Notification Template Wrapper saved.'));

            return $this->redirectToPostedUrl($record);
        }

        // Return JSON response if the request is an AJAX request
        if ($request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Notification Template Wrapper not saved.'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(['wrapper' => $record]);

        return $this->renderEditForm($record, $record->name);
    }

    private function renderEditForm(NotificationWrapperRecord $record, string $title): Response
    {
        $this->view->registerAssetBundle(NotificationEditorBundle::class);

        return $this->renderTemplate('freeform/notifications/wrappers/edit', [
            'wrapper' => $record,
            'title' => $title,
        ]);
    }
}
