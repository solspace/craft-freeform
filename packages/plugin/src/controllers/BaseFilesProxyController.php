<?php

namespace Solspace\Freeform\controllers;

use yii\web\Response;

/**
 * @deprecated No longer used in Freeform 5.2.3
 */
class BaseFilesProxyController extends BaseController
{
    protected function getFileResponse(string $filepath, string $filename, string $mimeType): Response
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
