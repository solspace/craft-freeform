<?php

namespace Solspace\Freeform\Controllers\REST;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class FormTypesController extends BaseController
{
    public function init()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        parent::init();
    }

    public function actionIndex(): Response
    {
        $types = Freeform::getInstance()->formTypes->getTypes();

        return $this->asJson($types);
    }
}
