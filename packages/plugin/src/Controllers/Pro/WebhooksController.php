<?php

namespace Solspace\Freeform\Controllers\Pro;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Pro\WebhookModel;
use Solspace\Freeform\Resources\Bundles\CrmBundle;
use Solspace\Freeform\Resources\Bundles\Pro\WebhooksBundle;
use Solspace\Freeform\Services\Pro\WebhooksService;
use Solspace\Freeform\Webhooks\Integrations\Generic;
use yii\web\ForbiddenHttpException as ForbiddenHttpExceptionAlias;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class WebhooksController extends BaseController
{
    /**
     * Make sure this controller requires a logged in member.
     */
    public function init()
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    /**
     * @throws ForbiddenHttpExceptionAlias
     */
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $webhooks = $this->getWebhooksService()->getAll();

        \Craft::$app->view->registerAssetBundle(CrmBundle::class);

        return $this->renderTemplate(
            'freeform/settings/_webhooks',
            [
                'webhooks' => $webhooks,
            ]
        );
    }

    /**
     * @throws \ReflectionException
     */
    public function actionCreate(): Response
    {
        return $this->renderEditForm(new WebhookModel(), Freeform::t('Create a new Webhook'));
    }

    /**
     * @throws ForbiddenHttpExceptionAlias
     * @throws NotFoundHttpException
     */
    public function actionEdit(int $id = null): Response
    {
        $webhook = $this->getWebhooksService()->getById($id);
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

        $id = $post['id'] ?? null;
        $formIds = $post['formIds'];
        if (!$formIds) {
            $formIds = [];
        }

        $model = $this->getWebhooksService()->getById($id);
        if (!$model) {
            $model = new WebhookModel();
        }

        $model->id = $id;
        $model->name = $post['name'] ?? null;
        $model->type = $post['type'] ?? Generic::class;
        $model->webhook = $post['webhook'] ?? null;

        $settings = $post['settings'] ?? [];

        $model->settings = $settings[$model->type] ?? [];

        if (!$model->getErrors() && $this->getWebhooksService()->save($model, $formIds)) {
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

        return $this->renderEditForm($model, $model->name ?: 'New Zapier Webhook');
    }

    /**
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
        $this->getWebhooksService()->delete($id);

        return $this->asJson(['success' => true]);
    }

    /**
     * @throws ForbiddenHttpExceptionAlias
     * @throws \yii\base\InvalidConfigException
     */
    private function renderEditForm(WebhookModel $webhook, string $title): Response
    {
        Freeform::getInstance()->requirePro();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        \Craft::$app->view->registerAssetBundle(WebhooksBundle::class);

        $formIds = $this->getWebhooksService()->getSelectedFormsFor($webhook);

        $webhookTypes = $this->getWebhooksService()->getAllWebhookProviders();

        return $this->renderTemplate('freeform/settings/_webhooks_edit', [
            'webhook' => $webhook,
            'webhookTypes' => $webhookTypes,
            'blockTitle' => $title,
            'continueEditingUrl' => 'freeform/settings/webhooks/{id}',
            'formList' => $this->getFormsService()->getAllFormNames(),
            'formIds' => $formIds,
        ]);
    }

    private function getWebhooksService(): WebhooksService
    {
        return Freeform::getInstance()->webhooks;
    }
}
