<?php

namespace Solspace\Freeform\controllers;

use yii\web\Response;

/**
 * @deprecated No longer used in Freeform 5.2.3
 */
class ResourcesController extends BaseFilesProxyController
{
    protected array|bool|int $allowAnonymous = ['plugin-js', 'plugin-css', 'embed-js'];

    public function actionEmbedJs(): Response
    {
        $path = \Craft::getAlias('@freeform-resources/js/external/embed.js');

        return $this->getFileResponse($path, 'embed.js', 'text/javascript');
    }

    public function actionPluginJs(): Response
    {
        $path = \Craft::getAlias('@freeform-resources/'.$this->getSettingsService()->getPluginJsPath());

        return $this->getFileResponse($path, 'plugin.js', 'text/javascript');
    }

    public function actionPluginCss(): Response
    {
        $path = \Craft::getAlias('@freeform-resources/'.$this->getSettingsService()->getPluginCssPath());

        return $this->getFileResponse($path, 'plugin.css', 'text/css');
    }
}
