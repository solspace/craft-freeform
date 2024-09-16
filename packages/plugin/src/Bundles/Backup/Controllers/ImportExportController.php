<?php

namespace Solspace\Freeform\Bundles\Backup\Controllers;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class ImportExportController extends BaseApiController
{
    public function actionNavigation(): Response
    {
        $navigation = Freeform::getInstance()->export->getNavigation();

        return $this->asSerializedJson($navigation);
    }
}
