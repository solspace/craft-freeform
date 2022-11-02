<?php

namespace Solspace\Freeform\controllers\client\api\forms;

use Solspace\Freeform\Bundles\Fields\BuilderFieldProvider;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class FieldsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config = [],
        private BuilderFieldProvider $fieldProvider
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionGet(int $formId): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        return $this->asJson($form->getLayout()->getFields());
    }

    public function actionGetOne(int $formId, int $id): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        return $this->asJson('ss');
    }
}
