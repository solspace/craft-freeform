<?php

namespace Solspace\Freeform\controllers\api\integrations;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class CrmController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        private IntegrationClientProvider $clientProvider,
        $config = [],
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionFields(string $category): Response
    {
        $id = $this->request->get('id');
        if (!$id) {
            throw new NotFoundHttpException('Integration not found');
        }

        /** @var CRMIntegrationInterface $integration */
        $integration = Freeform::getInstance()->crm->getIntegrationObjectById($id);
        if (!$integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $refresh = $this->request->get('refresh', false);
        $fields = $this->getCrmService()->getFields($integration, $category, $refresh);

        $payload = [];
        foreach ($fields as $field) {
            $payload[] = [
                'id' => $field->getHandle(),
                'label' => $field->getLabel(),
                'required' => $field->isRequired(),
                'type' => $field->getType(),
            ];
        }

        $serialized = $this->getSerializer()->serialize($payload, 'json');

        $this->response->format = Response::FORMAT_JSON;
        $this->response->content = $serialized;

        return $this->response;
    }
}
