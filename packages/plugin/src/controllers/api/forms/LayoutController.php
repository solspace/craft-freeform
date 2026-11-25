<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class LayoutController extends BaseCpApiController
{
    public function actionGet(int $formId): Response
    {
        PermissionHelper::requireFormManagePermission($formId);

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$formId} not found");
        }

        return $this->asJson($form->getLayout()->getFields());
    }
}
