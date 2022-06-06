<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Resources\Bundles\WelcomeScreenBundle;
use yii\web\Response;

class WelcomeScreenController extends BaseController
{
    public function actionIndex(): Response
    {
        WelcomeScreenBundle::register(\Craft::$app->getView());

        return $this->renderTemplate('freeform/welcome', ['settings' => Freeform::getInstance()->getSettings()]);
    }
}
