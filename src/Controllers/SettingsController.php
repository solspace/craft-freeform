<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use craft\helpers\FileHelper;
use craft\helpers\StringHelper;
use craft\helpers\UrlHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use Solspace\Freeform\Resources\Bundles\SettingsBundle;
use Solspace\FreeformPro\FreeformPro;
use yii\web\Response;

class SettingsController extends BaseController
{
    /**
     * Make sure this controller requires a logged in member
     */
    public function init()
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }
    }

    /**
     * Redirects to the default selected view
     */
    public function actionDefaultView(): Response
    {
        $defaultView = $this->getSettingsModel()->defaultView;

        $canAccessDashboard     = PermissionHelper::checkPermission(Freeform::PERMISSION_DASHBOARD_ACCESS);
        $canAccessForms         = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS);
        $canAccessSubmissions   = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $canAccessFields        = PermissionHelper::checkPermission(Freeform::PERMISSION_FIELDS_ACCESS);
        $canAccessNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);
        $canAccessSettings      = PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $isDashboardView  = $defaultView === Freeform::VIEW_DASHBOARD;
        $isFormView       = $defaultView === Freeform::VIEW_FORMS;
        $isSubmissionView = $defaultView === Freeform::VIEW_SUBMISSIONS;

        $cantAccessFormView       = $isFormView && !$canAccessForms;
        $cantAccessSubmissionView = $isSubmissionView && !$canAccessSubmissions;
        $cantAccessDashboardView  = $isDashboardView && !$canAccessDashboard;
        if ($cantAccessFormView || $cantAccessSubmissionView || $cantAccessDashboardView) {
            if ($canAccessDashboard) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_DASHBOARD));
            }

            if ($canAccessForms) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_FORMS));
            }

            if ($canAccessSubmissions) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_SUBMISSIONS));
            }

            if ($canAccessFields) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_FIELDS));
            }

            if ($canAccessNotifications) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_NOTIFICATIONS));
            }

            if ($canAccessSettings) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_SETTINGS));
            }

            if (Freeform::getInstance()->isPro() && PermissionHelper::checkPermission(FreeformPro::PERMISSION_EXPORT_PROFILES_ACCESS)) {
                return $this->redirect(UrlHelper::cpUrl('freeform/' . FreeformPro::VIEW_EXPORT_PROFILES));
            }
        }

        return $this->redirect(UrlHelper::cpUrl("freeform/$defaultView"));
    }

    /**
     * Attempt cloning a demo template into the user's specified template directory
     */
    public function actionAddDemoTemplate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $errors    = [];
        $settings  = $this->getSettingsModel();
        $extension = '.html';

        $templateDirectory = $settings->getAbsoluteFormTemplateDirectory();
        $templateName      = \Craft::$app->request->post('templateName', null);

        if (!$templateDirectory) {
            $errors[] = Freeform::t('No custom template directory specified in settings');
        } else {
            if ($templateName) {
                $templateName = StringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory . '/' . $templateName . $extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName . $extension]);
                } else {
                    try {
                        FileHelper::writeToFile($templatePath, $settings->getDemoTemplateContent());
                    } catch (FreeformException $exception) {
                        $errors[] = $exception->getMessage();
                    }
                }
            } else {
                $errors[] = Freeform::t('No template name specified');
            }
        }

        return $this->asJson(
            [
                'templateName' => $templateName . $extension,
                'errors'       => $errors,
            ]
        );
    }

    /**
     * Attempt cloning a demo email template into the user's specified template directory
     */
    public function actionAddEmailTemplate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $errors    = [];
        $settings  = $this->getSettingsModel();
        $extension = '.html';

        $templateDirectory = $settings->getAbsoluteEmailTemplateDirectory();
        $templateName      = \Craft::$app->request->post('templateName');

        if (!$templateDirectory) {
            $errors[] = Freeform::t('No custom template directory specified in settings');
        } else {
            if ($templateName) {
                $templateName = StringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory . '/' . $templateName . $extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName . $extension]);
                } else {
                    try {
                        FileHelper::writeToFile($templatePath, $settings->getEmailTemplateContent());
                    } catch (FreeformException $exception) {
                        $errors[] = $exception->getMessage();
                    }
                }
            } else {
                $errors[] = Freeform::t('No template name specified');
            }
        }

        return $this->asJson(
            [
                'templateName' => $templateName,
                'errors'       => $errors,
            ]
        );
    }

    /**
     * @return Response|null
     * @throws \yii\web\BadRequestHttpException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionSaveSettings()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();
        $postData = \Craft::$app->request->post('settings', []);

        $plugin = Freeform::getInstance();
        $plugin->setSettings($postData);

        if (\Craft::$app->plugins->savePluginSettings($plugin, $postData)) {
            \Craft::$app->session->setNotice(Freeform::t('Settings Saved'));

            return $this->redirectToPostedUrl();
        }

        $errors = $plugin->getSettings()->getErrors();
        \Craft::$app->session->setError(
            implode("\n", \Solspace\Commons\Helpers\StringHelper::flattenArrayValues($errors))
        );
    }

    /**
     * @return Response
     */
    public function actionProvideSetting(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->view->registerAssetBundle(CodepackBundle::class);
        $this->view->registerAssetBundle(SettingsBundle::class);
        $template = \Craft::$app->request->getSegment(3);

        return $this->renderTemplate(
            'freeform/settings/' . ($template ? '_' . (string) $template : ''),
            [
                'settings' => $this->getSettingsModel(),
            ]
        );
    }

    /**
     * @return Settings
     */
    private function getSettingsModel(): Settings
    {
        $settingsService = Freeform::getInstance()->settings;

        return $settingsService->getSettingsModel();
    }
}
