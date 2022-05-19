<?php

namespace Solspace\Freeform\controllers\api;

use craft\web\Request;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;
use yii\web\Response;

class SettingsController extends BaseController
{
    public function init(): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        parent::init();
    }

    public function actionGeneral(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'pluginName' => $this->getRequest()->getBodyParam('name'),
                'defaultView' => $this->getRequest()->getBodyParam('defaultView', 'dashboard'),
                'ajaxByDefault' => $this->getRequest()->getBodyParam('ajax', true),
                'formattingTemplate' => $this->getRequest()->getBodyParam('defaultFormattingTemplate', 'flexbox'),
                'formSubmitDisable' => $this->getRequest()->getBodyParam('disableSubmit', true),
                'autoScrollToErrors' => $this->getRequest()->getBodyParam('autoScroll', true),
                'scriptInsertLocation' => $this->getRequest()->getBodyParam('jsInsertLocation', Settings::SCRIPT_INSERT_LOCATION_FOOTER),
                'scriptInsertType' => $this->getRequest()->getBodyParam('jsInsertType', Settings::SCRIPT_INSERT_TYPE_INLINE),
                'sessionContext' => $this->getRequest()->getBodyParam('sessionType', Settings::CONTEXT_TYPE_PAYLOAD),
            ]
        );

        return $this->returnSuccess();
    }

    public function actionSpam(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'freeformHoneypot' => $this->getRequest()->getBodyParam('honeypot', true),
                'freeformHoneypotEnhancement' => $this->getRequest()->getBodyParam('enhancedHoneypot', false),
                'spamFolderEnabled' => $this->getRequest()->getBodyParam('spamFolder', true),
                'spamProtectionBehaviour' => $this->getRequest()->getBodyParam('spamBehaviour'),
            ]
        );

        return $this->returnSuccess();
    }

    public function actionReliability(): Response
    {
        $this->requirePostRequest();
        $this->saveSettings(
            [
                'alertNotificationRecipients' => $this->getRequest()->getBodyParam('errorRecipients'),
                'displayFeed' => $this->getRequest()->getBodyParam('updateNotices', true),
                'digestRecipients' => $this->getRequest()->getBodyParam('digestRecipients'),
                'digestFrequency' => (int) $this->getRequest()->getBodyParam('digestFrequency'),
                'clientDigestRecipients' => $this->getRequest()->getBodyParam('clientDigestRecipients'),
                'clientDigestFrequency' => (int) $this->getRequest()->getBodyParam('clientDigestFrequency'),
                'digestOnlyOnProduction' => $this->getRequest()->getBodyParam('digestProductionOnly', false),
            ]
        );

        return $this->returnSuccess();
    }

    private function saveSettings(array $settings): bool
    {
        $plugin = Freeform::getInstance();
        $plugin->setSettings($settings);

        return \Craft::$app->plugins->savePluginSettings($plugin, $settings);
    }

    private function returnSuccess(): Response
    {
        return $this->asJson(['success' => true]);
    }

    private function getRequest(): Request
    {
        return \Craft::$app->request;
    }
}
