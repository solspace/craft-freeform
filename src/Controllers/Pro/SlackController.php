<?php

namespace Solspace\Freeform\Controllers\Pro;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Resources\Bundles\CrmBundle;
use Solspace\Freeform\Services\Pro\SlackService;
use Solspace\Freeform\Webhooks\Integrations\Slack;
use yii\web\ForbiddenHttpException as ForbiddenHttpExceptionAlias;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class SlackController extends BaseController
{
    /**
     * Make sure this controller requires a logged in member
     */
    public function init()
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }
    }

    /**
     * @return Response
     * @throws ForbiddenHttpExceptionAlias
     */
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $webhooks = $this->getSlackService()->getAllWebhooks();

        \Craft::$app->view->registerAssetBundle(CrmBundle::class);

        return $this->renderTemplate(
            'freeform/settings/_slack',
            [
                'webhooks' => $webhooks,
            ]
        );
    }

    /**
     * @return Response
     * @throws \ReflectionException
     */
    public function actionCreate(): Response
    {
        return $this->renderEditForm(new Slack(), Freeform::t('Create a new Slack Webhook'));
    }

    /**
     * @param int|null $id
     *
     * @return Response
     * @throws ForbiddenHttpExceptionAlias
     * @throws NotFoundHttpException
     */
    public function actionEdit(int $id = null): Response
    {
        $webhook = $this->getSlackService()->getWebhookById($id);
        if (!$webhook) {
            throw new NotFoundHttpException(Freeform::t('Could not find webhook.'));
        }

        return $this->renderEditForm($webhook, $webhook->getName());
    }

    /**
     * @return Response
     */
    public function actionSave()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $id      = $post['id'] ?? null;
        $formIds = $post['formIds'];
        if (!$formIds) {
            $formIds = [];
        }

        $model = $this->getSlackService()->getWebhookById($id);
        if (!$model) {
            $model = new Slack();
        }

        $model->id       = $id;
        $model->name     = $post['name'] ?? null;
        $model->webhook  = $post['webhook'] ?? null;
        $model->settings = $post['settings'] ?? [];

        if (!$model->getErrors() && $this->getSlackService()->save($model, $formIds)) {

            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Webhook saved'));

            return $this->redirectToPostedUrl($model);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Webhook not saved'));

        return $this->renderEditForm($model, $model->name ? $model->name : 'New Slack Webhook');
    }

    /**
     * @return Response
     * @throws ForbiddenHttpExceptionAlias
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     * @throws \yii\web\BadRequestHttpException
     */
    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $id = \Craft::$app->request->post('id');
        $this->getSlackService()->delete($id);

        return $this->asJson(['success' => true]);
    }

    /**
     * @param Slack  $webhook
     * @param string $title
     *
     * @return Response
     * @throws ForbiddenHttpExceptionAlias
     */
    private function renderEditForm(Slack $webhook, string $title): Response
    {
        Freeform::getInstance()->requirePro();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $formIds = $this->getSlackService()->getSelectedFormsFor($webhook);

        return $this->renderTemplate('freeform/settings/_slack_edit', [
            'webhook'            => $webhook,
            'blockTitle'         => $title,
            'continueEditingUrl' => 'freeform/settings/slack/{id}',
            'formList'           => $this->getFormsService()->getAllFormNames(),
            'formIds'            => $formIds,
        ]);
    }

    /**
     * @return SlackService
     */
    private function getSlackService(): SlackService
    {
        return Freeform::getInstance()->slack;
    }
}
