<?php

namespace Solspace\Freeform\Controllers\REST;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\FormTypes\FormTypeInterface;
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

        $results = [];

        /**
         * @var FormTypeInterface $class
         */
        foreach ($types as $class => $type) {
            $results[] = [
                'class' => $class,
                'name' => $type,
                'properties' => $class::getPropertyManifest(),
            ];
        }

        return $this->asJson($results);
    }
}
