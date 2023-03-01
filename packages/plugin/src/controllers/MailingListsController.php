<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers;

use craft\helpers\UrlHelper;
use GuzzleHttp\Exception\RequestException;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListOAuthConnector;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Resources\Bundles\IntegrationsBundle;
use Solspace\Freeform\Resources\Bundles\MailingListsBundle;
use Solspace\Freeform\Services\IntegrationsService;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class MailingListsController extends BaseController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private IntegrationsService $integrationsService
    ) {
        parent::__construct($id, $module, $config);
    }

    public function init(): void
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $integrations = $this->getMailingListsService()->getAllIntegrations();

        \Craft::$app->view->registerAssetBundle(MailingListsBundle::class);

        return $this->renderTemplate(
            'freeform/settings/_mailing_lists',
            [
                'integrations' => $integrations,
                'providers' => $this->getMailingListsService()->getAllServiceProviders(),
            ]
        );
    }

    public function actionCreate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $model = IntegrationModel::create(IntegrationRecord::TYPE_MAILING_LIST);
        $title = Freeform::t('Create new mailing list');

        return $this->renderEditForm($model, $title);
    }

    public function actionEdit(mixed $id = null, IntegrationModel $model = null): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        if (null === $model) {
            if (is_numeric($id)) {
                $model = $this->getMailingListsService()->getIntegrationById($id);
            }

            if (!$model && $id) {
                $model = $this->getMailingListsService()->getIntegrationByHandle($id);
            }
        }

        if (!$model) {
            throw new HttpException(404, Freeform::t('Email Marketing integration not found'));
        }

        return $this->renderEditForm($model, $model->name);
    }

    public function actionHandleOAuthRedirect(string $handle = null): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $model = $this->getMailingListsService()->getIntegrationByHandle($handle);

        if (!$model) {
            throw new \HttpException(
                404,
                Freeform::t('Email Marketing integration with ID {id} not found', ['id' => $id])
            );
        }

        if (\Craft::$app->request->getParam('code')) {
            $response = $this->handleOAuthAuthorization($model);

            if (null !== $response) {
                return $response;
            }
        }

        return $this->renderEditForm($model, $model->name);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $handle = $post['handle'] ?? null;
        $id = $post['id'] ?? null;

        if ($id) {
            $model = $this->getMailingListsService()->getIntegrationById($id);
        } else {
            $model = $this->getNewOrExistingMailingListIntegrationModel($handle);
        }

        if (!$model) {
            throw new NotFoundHttpException(
                Freeform::t('Email Marketing integration with ID {id} not found', ['id' => $id])
            );
        }

        $postedClass = $post['class'];
        $model->class = $postedClass;

        $postedClassSettings = $post['properties'][$postedClass] ?? [];
        unset($post['properties']);
        $post['metadata'] = $postedClassSettings ?: null;

        $model->setAttributes($post);
        $this->integrationsService->parsePostedModelData($model);

        $integration = $model->getIntegrationObject();

        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        $this->integrationsService->updateModelFromIntegration($model, $integration);

        if ($this->integrationsService->save($model)) {
            // If it's a new integration - we make the user complete OAuth2 authentication
            $model->getIntegrationObject()->initiateAuthentication();

            // Return JSON response if the request is an AJAX request
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Email Marketing Integration saved'));
            \Craft::$app->session->setFlash('Email Marketing Integration saved');

            return $this->redirectToPostedUrl($model);
        }

        // Return JSON response if the request is an AJAX request
        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Email Marketing Integration not saved'));

        return $this->renderEditForm($model, $model->name);
    }

    public function actionCheckIntegrationConnection(): Response
    {
        $id = \Craft::$app->request->post('id');

        $integration = $this->getMailingListsService()->getIntegrationObjectById($id);

        try {
            if ($integration->checkConnection()) {
                return $this->asJson(['success' => true]);
            }

            return $this->asJson(['success' => false]);
        } catch (RequestException|\Exception $e) {
            return $this->asJson(['success' => false, 'errors' => [$e->getMessage()]]);
        }
    }

    public function actionForceAuthorization(string $handle)
    {
        $model = $this->getMailingListsService()->getIntegrationByHandle($handle);

        if (!$model) {
            throw new IntegrationException(
                Freeform::t("Mailing list with handle '{handle}' not found", ['handle' => $handle])
            );
        }

        $integration = $model->getIntegrationObject();
        $integration->initiateAuthentication();

        $this->redirect(UrlHelper::cpUrl('freeform/settings/mailing-lists/'.$model->id));
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $id = \Craft::$app->request->post('id');
        $this->integrationsService->delete($id);

        return $this->asJson(['success' => true]);
    }

    private function getNewOrExistingMailingListIntegrationModel(string $handle): IntegrationModel
    {
        $mailingListIntegration = $this->getMailingListsService()->getIntegrationByHandle($handle);

        if (!$mailingListIntegration) {
            $mailingListIntegration = IntegrationModel::create(IntegrationRecord::TYPE_MAILING_LIST);
        }

        return $mailingListIntegration;
    }

    private function renderEditForm(IntegrationModel $model, string $title): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->view->registerAssetBundle(IntegrationsBundle::class);

        if (\Craft::$app->request->getParam('code')) {
            $this->handleOAuthAuthorization($model);
        }

        $serviceProviderTypes = $this->getMailingListsService()->getAllServiceProviders();

        $variables = [
            'integration' => $model,
            'integrationObject' => $model->getIntegrationObject(),
            'blockTitle' => $title,
            'serviceProviderTypes' => $serviceProviderTypes,
            'continueEditingUrl' => 'freeform/settings/mailing-lists/{handle}',
        ];

        return $this->renderTemplate('freeform/settings/_mailing_list_edit', $variables);
    }

    private function getNewOrExistingIntegration(int $id = null): IntegrationModel
    {
        if (null === $id) {
            $model = null;
        } else {
            $model = $this->getMailingListsService()->getIntegrationById($id);
        }

        if (!$model) {
            $model = IntegrationModel::create(IntegrationRecord::TYPE_MAILING_LIST);
        }

        return $model;
    }

    private function handleOAuthAuthorization(IntegrationModel $model): void
    {
        $integration = $model->getIntegrationObject();
        $code = \Craft::$app->request->getParam('code');

        if (!$integration instanceof MailingListOAuthConnector || empty($code)) {
            return;
        }

        $integration->fetchTokens();

        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        $this->integrationsService->updateModelFromIntegration($model, $integration);

        if ($this->integrationsService->save($model)) {
            // Return JSON response if the request is an AJAX request
            \Craft::$app->session->setNotice(Freeform::t('Email Marketing Integration saved'));
            \Craft::$app->session->setFlash(Freeform::t('Email Marketing Integration saved'));
        } else {
            \Craft::$app->session->setError(Freeform::t('Email Marketing Integration not saved'));
        }

        $this->redirect(UrlHelper::cpUrl('freeform/settings/mailing-lists/'.$model->id));
    }
}
