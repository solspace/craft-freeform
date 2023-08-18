<?php

namespace Solspace\Freeform\controllers;

use yii\web\Response;

class ResourcesController extends BaseController
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

    private function getFileResponse(string $filepath, string $filename, string $mimeType): Response
    {
        $response = \Craft::$app->response;

        $hash = sha1_file($filepath);
        $timestamp = filemtime($filepath);
        $mtime = gmdate('D, d M Y H:i:s ', $timestamp).'GMT';

        // 604800 = 1 week
        $response->headers->set('Cache-Control', 'public, max-age=604800, must-revalidate');
        $response->headers->set('ETag', $hash);
        $response->headers->set('Last-Modified', $mtime);

        return $response->sendFile(
            $filepath,
            $filename,
            [
                'mimeType' => $mimeType,
                'inline' => true,
            ]
        );
    }
}
