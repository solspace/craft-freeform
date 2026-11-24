<?php

namespace Solspace\Freeform\controllers\export;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\OverviewCardHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class OverviewController extends BaseController
{
    public function actionIndex(): Response
    {
        $this->requireCpRequest();

        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS)
            && !PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS)
            && !PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS)
        ) {
            throw new ForbiddenHttpException();
        }

        $freeform = Freeform::getInstance();
        $overview = OverviewCardHelper::groupByAccess($freeform->export->getOverviewCards(), $freeform->edition());

        return $this->renderTemplate('freeform/export/index', $overview);
    }
}
