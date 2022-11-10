<?php

namespace Solspace\Freeform\controllers\client\api\forms;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormIntegrationsProvider $formIntegrationsProvider,
        private IntegrationDTOProvider $integrationDTOProvider
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        $models = $this->formIntegrationsProvider->getForForm($form);
        $dtos = $this->integrationDTOProvider->convert($models);

        return $this->asJson($dtos);
    }

    public function actionGetOne(int $formId, int $id): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        $dto = $this->integrationDTOProvider->getById($id);
        if (!$dto) {
            return $this->asJson(null);
        }

        return $this->asJson($dto);
    }
}
