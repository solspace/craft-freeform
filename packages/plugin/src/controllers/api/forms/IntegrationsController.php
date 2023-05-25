<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Symfony\Component\Serializer\Serializer;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormIntegrationsProvider $formIntegrationsProvider,
        private IntegrationDTOProvider $integrationDTOProvider,
        private Serializer $serializer,
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        $models = $this->formIntegrationsProvider->getForForm($form);
        $dtos = $this->integrationDTOProvider->convert($models);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $this->serializer->serialize($dtos, 'json');

        return $this->response;
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
