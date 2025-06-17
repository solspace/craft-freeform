<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class WrappersController extends BaseController
{
    public function actionIndex(): Response
    {
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

        return $this->renderEditForm($record, 'New Wrapper');
    }

    public function actionEdit(int $id): Response
    {
        $record = NotificationWrapperRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('Notification wrapper not found');
        }

        return $this->renderEditForm($record, $record->name);
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
