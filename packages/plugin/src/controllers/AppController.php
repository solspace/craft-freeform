<?php

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\FreeformConfig;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Resources\Bundles\FreeformClientBundle;
use yii\web\Response;

class AppController extends BaseController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $translations = include __DIR__.'/../translations/en/freeform.php';
        $translations = array_keys($translations);

        $this->view->registerAssetBundle(FreeformClientBundle::class);
        $this->view->registerTranslations(Freeform::TRANSLATION_CATEGORY, $translations);

        $config = \Craft::$container->get(FreeformConfig::class);

        $response = $this->renderTemplate('freeform/app', [
            'config' => $config,
        ]);

        // Craft 6 CP uses Inertia for navigation. When visiting legacy React app pages
        // from an Inertia context, signal a full page reload (see cp.ts handleNonInertiaRequests).
        if ($this->request->headers->get('X-Inertia')) {
            $response->headers->set('X-Redirect', $this->request->absoluteUrl);
        }

        return $response;
    }
}
