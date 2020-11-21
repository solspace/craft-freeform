<?php

namespace Solspace\Freeform\Controllers;

use Solspace\Freeform\Freeform;
use yii\web\Response;

class BannersController extends BaseController
{
    /**
     * @return Response
     */
    public function actionDismissDemo(): Response
    {
        $plugin  = Freeform::getInstance();
        $success = \Craft::$app->plugins->savePluginSettings($plugin, ['hideBannerDemo' => true]);

        return $this->asJson(['success' => $success]);
    }
}
