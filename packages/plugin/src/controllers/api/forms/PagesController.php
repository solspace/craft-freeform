<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PagesController extends BaseApiController
{
    public function actionGetType(): Response
    {
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        return $this->asJson($form->getLayout()->getFields());
    }
}
