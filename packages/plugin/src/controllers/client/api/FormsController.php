<?php

namespace Solspace\Freeform\controllers\client\api;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\NotFoundHttpException;

class FormsController extends BaseApiController
{
    protected function get(): array
    {
        return $this->getFormsService()->getResolvedForms();
    }

    protected function getOne($id): array|object|null
    {
        $forms = $this->getFormsService()->getResolvedForms(['handle' => $id]);
        $form = reset($forms);

        if (!$form) {
            throw new NotFoundHttpException("Form with ID {$id} not found");
        }

        return $form;
    }
}
