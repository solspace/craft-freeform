<?php

namespace Solspace\Freeform\controllers\client;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Resources\Bundles\FreeformClientBundle;
use yii\web\Response;

class ViewController extends BaseController
{
    public function actionIndex(): Response
    {
        $this->view->registerAssetBundle(FreeformClientBundle::class);

        return $this->renderTemplate('freeform/client');
    }
}
