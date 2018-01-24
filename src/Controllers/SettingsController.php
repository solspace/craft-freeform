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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\PermissionsHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use yii\web\Response;

class SettingsController extends BaseController
{
    /**
     * Make sure this controller requires a logged in member
     */
    public function init()
    {
        $this->requireLogin();
    }

    /**
     * Redirects to the default selected view
     */
    public function actionDefaultView(): Response
    {
        $defaultView = $this->getSettingsModel()->defaultView;

        $canAccessForms = PermissionsHelper::checkPermission(PermissionsHelper::PERMISSION_FORMS_ACCESS);
        $canAccessSubmissions = PermissionsHelper::checkPermission(PermissionsHelper::PERMISSION_SUBMISSIONS_ACCESS);
        $canAccessFields = PermissionsHelper::checkPermission(PermissionsHelper::PERMISSION_FIELDS_ACCESS);
        $canAccessNotifications = PermissionsHelper::checkPermission(PermissionsHelper::PERMISSION_NOTIFICATIONS_ACCESS);
        $canAccessSettings = PermissionsHelper::checkPermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

        $isFormView = $defaultView === Freeform::VIEW_FORMS;
        $isSubmissionView = $defaultView === Freeform::VIEW_SUBMISSIONS;

        if (($isFormView && !$canAccessForms) || ($isSubmissionView && !$canAccessSubmissions)) {
            if ($canAccessForms) {
                $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_FORMS));
            }

            if ($canAccessSubmissions) {
                $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_SUBMISSIONS));
            }

            if ($canAccessFields) {
                $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_FIELDS));
            }

            if ($canAccessNotifications) {
                $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_NOTIFICATIONS));
            }

            if ($canAccessSettings) {
                $this->redirect(UrlHelper::cpUrl('freeform/' . Freeform::VIEW_SETTINGS));
            }
        }

        return $this->redirect(UrlHelper::cpUrl("freeform/$defaultView"));
    }

    /**
     * Attempt cloning a demo template into the user's specified template directory
     */
    public function actionAddDemoTemplate(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

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
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

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
     * Renders the General settings page template
     */
    public function actionGeneral(): Response
    {
        return $this->provideTemplate('general');
    }

    /**
     * Renders the General settings page template
     */
    public function actionFormattingTemplates(): Response
    {
        $this->view->registerAssetBundle(CodepackBundle::class);

        return $this->provideTemplate('formatting_templates');
    }

    /**
     * Renders the General settings page template
     */
    public function actionEmailTemplates(): Response
    {
        $this->view->registerAssetBundle(CodepackBundle::class);

        return $this->provideTemplate('email_templates');
    }

    /**
     * @return Response|null
     * @throws \yii\web\BadRequestHttpException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionSaveSettings()
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();
        $postData = \Craft::$app->request->post('settings', []);

        $plugin = Freeform::getInstance();
        $plugin->setSettings($postData);

        if (\Craft::$app->plugins->savePluginSettings($plugin, $postData)) {
            \Craft::$app->session->setNotice(Freeform::t('Settings Saved'));
            return $this->redirectToPostedUrl();
        }

        \Craft::$app->session->setError(Freeform::t('Settings not saved'));
    }

    /**
     * Determines which template has to be rendered based on $template
     * Adds a Freeform_SettingsModel to template variables
     *
     * @param string $template
     *
     * @return Response
     */
    private function provideTemplate($template): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

        return $this->renderTemplate(
            'freeform/settings/_' . $template,
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
