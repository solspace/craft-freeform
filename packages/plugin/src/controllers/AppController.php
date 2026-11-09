<?php

namespace Solspace\Freeform\controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\FreeformConfig;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Resources\Bundles\FreeformClientBundle;
use yii\web\Response;

class AppController extends BaseController
{
    public function actionIndex(): Response
    {
        $request = \Craft::$app->getRequest();
        $isSetup = 'settings' === $request->getSegment(2) && 'setup' === $request->getSegment(3);
        PermissionHelper::requirePermission($isSetup ? Freeform::PERMISSION_SETTINGS_ACCESS : Freeform::PERMISSION_FORMS_ACCESS);
        if ($isSetup && !$this->getSettingsService()->canUseSetupGuide()) {
            return $this->redirect(UrlHelper::cpUrl('freeform/settings'));
        }

        $translations = include __DIR__.'/../translations/en/freeform.php';
        $translations = array_keys($translations);

        $this->view->registerAssetBundle(FreeformClientBundle::class);
        $this->view->registerTranslations(Freeform::TRANSLATION_CATEGORY, $translations);

        $config = \Craft::$container->get(FreeformConfig::class);

        return $this->renderTemplate('freeform/app', [
            'config' => $config,
        ]);
    }
}
