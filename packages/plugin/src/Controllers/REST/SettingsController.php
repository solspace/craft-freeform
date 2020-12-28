<?php

namespace Solspace\Freeform\Controllers\REST;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;
use yii\web\Response;

class SettingsController extends BaseController
{
    public function init()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        parent::init();
    }

    public function actionGeneral(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'pluginName' => $this->request->getBodyParam('name'),
                'defaultView' => $this->request->getBodyParam('defaultView', 'dashboard'),
                'ajaxByDefault' => $this->request->getBodyParam('ajax', true),
                'formattingTemplate' => $this->request->getBodyParam('defaultFormattingTemplate', 'flexbox'),
                'formSubmitDisable' => $this->request->getBodyParam('disableSubmit', true),
                'autoScrollToErrors' => $this->request->getBodyParam('autoScroll', true),
                'scriptInsertLocation' => $this->request->getBodyParam('jsInsertLocation', Settings::SCRIPT_INSERT_LOCATION_FOOTER),
            ]
        );

        return $this->returnSuccess();
    }

    public function actionSpam(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'freeformHoneypot' => $this->request->getBodyParam('honeypot', true),
                'freeformHoneypotEnhancement' => $this->request->getBodyParam('enhancedHoneypot', false),
                'spamFolderEnabled' => $this->request->getBodyParam('spamFolder', true),
                'spamProtectionBehaviour' => $this->request->getBodyParam('spamBehaviour'),
            ]
        );

        return $this->returnSuccess();
    }

    public function actionReliability(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'alertNotificationRecipients' => $this->request->getBodyParam('errorRecipients'),
                'displayFeed' => $this->request->getBodyParam('updateNotices', true),
                'digestRecipients' => $this->request->getBodyParam('digestRecipients'),
                'digestFrequency' => $this->request->getBodyParam('digestFrequency'),
                'clientDigestRecipients' => $this->request->getBodyParam('clientDigestRecipients'),
                'clientDigestFrequency' => $this->request->getBodyParam('clientDigestFrequency'),
                'digestOnlyOnProduction' => $this->request->getBodyParam('digestProductionOnly', false),
            ]
        );

        return $this->returnSuccess();
    }

    private function saveSettings(array $settings)
    {
        $plugin = Freeform::getInstance();
        $plugin->setSettings($settings);

        return \Craft::$app->plugins->savePluginSettings($plugin, $settings);
    }

    private function returnSuccess(): Response
    {
        return $this->asJson(['success' => true]);
    }
}
