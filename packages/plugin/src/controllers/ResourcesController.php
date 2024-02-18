<?php

namespace Solspace\Freeform\controllers;

use yii\web\Response;

class ResourcesController extends BaseFilesProxyController
{
    protected array|bool|int $allowAnonymous = ['plugin-js', 'plugin-css'];

    public function actionPluginJs(): Response
    {
        return $this->getFileResponse(
            $this->getSettingsService()->getPluginJsPath(),
            'plugin.js',
            'text/javascript'
        );
    }

    public function actionPluginCss(): Response
    {
        return $this->getFileResponse(
            $this->getSettingsService()->getPluginCssPath(),
            'plugin.css',
            'text/css'
        );
    }
}
