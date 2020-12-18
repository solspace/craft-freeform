<?php

namespace Solspace\Freeform\Controllers;

use Solspace\Freeform\Resources\Bundles\SetupScreenBundle;
use yii\web\Response;

class SetupController extends BaseController
{
    public function actionIndex(): Response
    {
        SetupScreenBundle::register(\Craft::$app->getView());

        return $this->renderTemplate('freeform/setup');
    }
}
