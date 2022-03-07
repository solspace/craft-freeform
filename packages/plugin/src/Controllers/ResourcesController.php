<?php

namespace Solspace\Freeform\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Resources\Bundles\ResourcesBundle;
use yii\web\Response;

class ResourcesController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['plugin-js', 'plugin-css'];

    public function actionIndex(): Response
    {
        return $this->redirect(UrlHelper::cpUrl('freeform/resources/community'));
    }

    public function actionCommunity(): Response
    {
        ResourcesBundle::register(\Craft::$app->getView());

        return $this->renderTemplate('freeform/resources/community', [
            'icons' => $this->getIcons(['so', 'discord', 'feedback']),
        ]);
    }

    public function actionExplore(): Response
    {
        ResourcesBundle::register(\Craft::$app->getView());

        return $this->renderTemplate(
            'freeform/resources/explore',
            [
                'isPro' => Freeform::getInstance()->isPro(),
                'icons' => $this->getIcons(['freeform', 'calendar', 'express', 'develop']),
            ]
        );
    }

    public function actionSupport(): Response
    {
        ResourcesBundle::register(\Craft::$app->getView());

        return $this->renderTemplate('freeform/resources/support', [
            'icons' => $this->getIcons(['github', 'support', 'feedback', 'newsletter']),
        ]);
    }

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

    private function getIcons(array $names): array
    {
        $path = __DIR__.'/../Resources/Bundles/Assets/Resources/';

        $urls = [];
        foreach ($names as $name) {
            $urls[$name] = file_get_contents($path.$name.'.svg');
            // $urls[$name] = \Craft::$app->assetManager->getPublishedUrl(
            //     $path . $name . '.svg',
            //     true
            // );
        }

        return $urls;
    }
}
