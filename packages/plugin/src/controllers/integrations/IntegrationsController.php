<?php

namespace Solspace\Freeform\controllers\integrations;

use craft\helpers\UrlHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListOAuthConnector;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Resources\Bundles\IntegrationsBundle;
use Solspace\Freeform\Services\IntegrationsService;
use yii\web\HttpException;
use yii\web\Response;

abstract class IntegrationsController extends BaseController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private IntegrationsService $integrationsService,
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
        \Craft::$app->view->registerAssetBundle(IntegrationsBundle::class);

        return $this->renderTemplate(
            'freeform/settings/integrations/list',
            [
                'title' => $this->getTitle(),
                'type' => $this->getType(),
                'integrations' => $this->getIntegrationModels(),
                'providers' => $this->getServiceProviderTypes(),
            ]
        );
    }

    public function actionCreate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $model = IntegrationModel::create($this->getIntegrationType());
        $title = Freeform::t('Create new');

        return $this->renderEditForm($model, $title);
    }

    public function actionEdit(mixed $id = null, IntegrationModel $model = null): Response
    {
        $model = $this->getNewOrExistingModel($id);
        if (!$model->id) {
            throw new HttpException(404, Freeform::t('Integration not found'));
        }

        return $this->renderEditForm($model, $model->name);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $id = $post['id'] ?? null;
        $model = $this->getNewOrExistingModel($id);

        $model->class = $post['class'];

        $properties = $post['properties'][$model->class] ?? [];
        $post['metadata'] = $properties ?: null;
        unset($post['properties']);

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
            $model->getIntegrationObject()->initiateAuthentication();

            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Integration saved'));
            \Craft::$app->session->setFlash('Integration saved');

            return $this->redirectToPostedUrl($model);
        }

        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Integration not saved'));

        return $this->renderEditForm($model, $model->name);
    }

    public function actionCheckIntegrationConnection(): Response
    {
        $id = \Craft::$app->request->post('id');

        $integration = $this->getIntegrationsService()->getById((int) $id);

        try {
            if ($integration->getIntegrationObject()->checkConnection()) {
                return $this->asJson(['success' => true]);
            }

            return $this->asJson(['success' => false]);
        } catch (\Exception $e) {
            return $this->asJson(['success' => false, 'errors' => [$e->getMessage()]]);
        }
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $id = \Craft::$app->request->post('id');
        $this->integrationsService->delete($id);

        return $this->asJson(['success' => true]);
    }

    public function actionForceAuthorization(string $handle)
    {
        $model = $this->getIntegrationsService()->getByHandle($handle);

        if (!$model) {
            throw new IntegrationException(
                Freeform::t(
                    "Integration with handle '{handle}' not found",
                    ['handle' => $handle]
                )
            );
        }

        $integration = $model->getIntegrationObject();
        $integration->initiateAuthentication();

        $this->redirect(UrlHelper::cpUrl('freeform/settings/'.$this->getType().'/'.$model->id));
    }

    protected function renderEditForm(IntegrationModel $model, string $title): Response
    {
        $this->view->registerAssetBundle(IntegrationsBundle::class);

        if (\Craft::$app->request->getParam('code')) {
            $this->handleOAuthAuthorization($model);
        }

        $this->getIntegrationsService()->decryptModelValues($model);

        $variables = [
            'integration' => $model,
            'blockTitle' => $title,
            'serviceProviderTypes' => $this->getServiceProviderTypes(),
            'continueEditingUrl' => 'freeform/settings/'.$this->getType().'/{handle}',
            'action' => 'freeform/'.$this->getAction().'/save',
            'title' => $this->getTitle(),
            'type' => $this->getType(),
        ];

        return $this->renderTemplate('freeform/settings/integrations/edit', $variables);
    }

    protected function getRenderVariables(IntegrationModel $model): array
    {
        return [];
    }

    protected function getAction(): string
    {
        return $this->getType();
    }

    abstract protected function getIntegrationModels(): array;

    abstract protected function getServiceProviderTypes(): array;

    abstract protected function getTitle(): string;

    abstract protected function getType(): string;

    abstract protected function getIntegrationType(): string;

    abstract protected function getNewOrExistingModel(string|int|null $id): IntegrationModel;

    private function handleOAuthAuthorization(IntegrationModel $model): void
    {
        $integration = $model->getIntegrationObject();
        if (!$integration instanceof CRMOAuthConnector && !$integration instanceof MailingListOAuthConnector) {
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
            \Craft::$app->session->setNotice(Freeform::t('Integration saved'));
            \Craft::$app->session->setFlash('Integration saved');

            $this->redirect(UrlHelper::cpUrl('freeform/settings/'.$this->getType().'/'.$model->id));

            return;
        }

        \Craft::$app->session->setError(Freeform::t('Integration not saved'));

        $this->redirect(UrlHelper::cpUrl('freeform/settings/'.$this->getType().'/'.$model->id));
    }
}
