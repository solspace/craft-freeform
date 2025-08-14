<?php

namespace Solspace\Freeform\controllers\integrations;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\controllers\PopUpTrait;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Resources\Bundles\IntegrationsBundle;
use Solspace\Freeform\Resources\Bundles\IntegrationsEditBundle;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseController
{
    use PopUpTrait;

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationsService $integrationsService,
        private IntegrationClientProvider $clientProvider,
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

    public function actionIndex(string $type): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        \Craft::$app->view->registerAssetBundle(IntegrationsBundle::class);

        return $this->renderTemplate(
            'freeform/settings/integrations/list',
            [
                'title' => $this->getTitle($type),
                'type' => $type,
                'integrations' => $this->getIntegrationModels($type),
                'providers' => $this->getServiceProviderTypes($type),
            ]
        );
    }

    public function actionAuthorize(int $id): Response
    {
        $integration = $this->integrationsService->getIntegrationObjectById($id);
        if (!$integration) {
            throw new NotFoundHttpException();
        }

        $event = new AuthorizeIntegrationEvent($integration);

        try {
            Event::trigger(
                APIIntegrationInterface::class,
                APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
                $event
            );
        } catch (\Exception $e) {
            $event->addError($e->getMessage());
        }

        if ($event->hasErrors()) {
            return $this->renderPopUpError($event->getErrors());
        }

        $this->integrationsService->setConnectionEstablished($integration);

        return $this->closePopUpWindowResponse();
    }

    public function actionCreate(string $type): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $model = IntegrationModel::create($type);

        $serviceProvider = $this->request->get('serviceProvider');
        if (null !== $serviceProvider) {
            $model->class = $serviceProvider;
        }

        return $this->renderEditForm($model);
    }

    public function actionEdit(string $type, mixed $id = null): Response
    {
        $model = $this->getNewOrExistingModel($id, $type);
        if (!$model->id) {
            throw new HttpException(404, Freeform::t('Integration not found'));
        }

        return $this->renderEditForm($model);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $id = $post['id'] ?? null;
        $type = $post['type'];
        $model = $this->getNewOrExistingModel($id, $type);

        if (!$model->id) {
            $model->class = $post['class'];
        }

        $properties = $post['properties'][$model->class] ?? [];
        $post['metadata'] = $properties ?: null;
        unset($post['properties']);

        foreach ($post as $key => $value) {
            if (!$model->isAttributeSafe($key)) {
                continue;
            }

            if ('metadata' === $key) {
                $model->metadata = array_merge(
                    $model->metadata ?? [],
                    $value ?: []
                );
            } else {
                $model->{$key} = $value;
            }
        }

        $this->integrationsService->parsePostedModelData($model, array_keys($post['metadata']));

        $integration = $model->getIntegrationObject();

        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        if ($this->integrationsService->save($model, $integration, true)) {
            if (\Craft::$app->request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setSuccess(Freeform::t('Integration saved.'));

            return $this->redirectToPostedUrl($model);
        }

        if (\Craft::$app->request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Integration not saved.'));

        return $this->renderEditForm($model);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $id = \Craft::$app->request->post('id');
        $this->integrationsService->delete($id);

        return $this->asJson(['success' => true]);
    }

    protected function renderEditForm(IntegrationModel $model): Response
    {
        $this->view->registerAssetBundle(IntegrationsBundle::class);
        $this->view->registerAssetBundle(IntegrationsEditBundle::class);

        $this->getIntegrationsService()->decryptModelValues($model);
        $type = $model->type;

        $variables = [
            'integration' => $model,
            'serviceProviderTypes' => $this->getServiceProviderTypes($type),
            'continueEditingUrl' => 'freeform/settings/integrations/'.$type.'/{handle}',
            'action' => 'freeform/integrations/integrations/save',
            'title' => $this->getTitle($type),
            'type' => $type,
        ];

        return $this->renderTemplate('freeform/settings/integrations/edit', $variables);
    }

    protected function getIntegrationModels(string $type): array
    {
        return $this->integrationsService->getAllIntegrations($type);
    }

    protected function getServiceProviderTypes(string $type): array
    {
        return $this->integrationsService->getAllServiceProviders($type);
    }

    protected function getNewOrExistingModel(null|int|string $id, string $type): IntegrationModel
    {
        $model = null;
        if (is_numeric($id)) {
            $model = $this->integrationsService->getById($id);
        } elseif (\is_string($id)) {
            $model = $this->integrationsService->getByHandle($id);
        }

        if (!$model) {
            $model = IntegrationModel::create($type);
        }

        return $model;
    }

    private function getTitle(string $type): string
    {
        return StringHelper::titleize(
            implode(
                ' ',
                StringHelper::toWords($type, removePunctuation: true)
            )
        );
    }
}
