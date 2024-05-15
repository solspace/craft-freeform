<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormIntegrationsProvider $formIntegrationsProvider,
        private IntegrationDTOProvider $integrationDTOProvider,
        private FreeformSerializer $serializer,
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);

        $integrations = $this->formIntegrationsProvider->getForForm($form, enabled: null);
        $dtos = $this->integrationDTOProvider->convert($integrations);

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $this->serializer->serialize($dtos, 'json');

        return $this->response;
    }
}
