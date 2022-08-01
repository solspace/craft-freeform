<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    public function actionGet(int $formId): Response
    {
        return $this->asJson($this->getIntegrationsService()->getAllIntegrations());
    }

    public function actionGetOne(int $formId, int $id): Response
    {
        $forms = $this->getFormsService()->getResolvedForms(['id' => $id]);
        $form = reset($forms);

        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$id} not found");
        }

        return $form;
    }
}
