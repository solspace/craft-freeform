<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Freeform;
use yii\web\Response;

class BannersController extends BaseController
{
    public function actionDismissDemo(): Response
    {
        $plugin = Freeform::getInstance();
        $success = \Craft::$app->plugins->savePluginSettings($plugin, ['hideBannerDemo' => true]);

        return $this->asJson(['success' => $success]);
    }
}
