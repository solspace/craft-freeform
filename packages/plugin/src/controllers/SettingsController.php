<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\controllers;

use craft\helpers\FileHelper;
use craft\helpers\StringHelper as CraftStringHelper;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Jobs\ManagedPingerDeleteJob;
use Solspace\Freeform\Jobs\ManagedPingerDeregisterJob;
use Solspace\Freeform\Jobs\ManagedPingerRegisterJob;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use Solspace\Freeform\Resources\Bundles\SettingsBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\web\Response;

class SettingsController extends BaseController
{
    private const AVAILABLE_VIEWS = [
        Freeform::VIEW_FORMS,
        Freeform::VIEW_SUBMISSIONS,
        Freeform::VIEW_NOTIFICATIONS,
        Freeform::VIEW_SETTINGS,
        Freeform::VIEW_EXPORT_PROFILES,
    ];

    public function init(): void
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    public function actionIndex(): Response
    {
        if ($this->getSettingsService()->isAllowAdminEdit()) {
            return $this->actionProvideSetting();
        }

        return $this->redirect(UrlHelper::cpUrl('freeform/settings/statuses'));
    }

    public function actionDefaultView(): Response
    {
        $defaultView = $this->getSettingsModel()->defaultView;
        if (!\in_array($defaultView, self::AVAILABLE_VIEWS, true)) {
            $defaultView = Freeform::VIEW_FORMS;
        }

        $canAccessForms = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS);
        $canAccessSubmissions = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $canAccessNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);
        $canAccessSettings = PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $isFormView = Freeform::VIEW_FORMS === $defaultView;
        $isSubmissionView = Freeform::VIEW_SUBMISSIONS === $defaultView;

        $cantAccessFormView = $isFormView && !$canAccessForms;
        $cantAccessSubmissionView = $isSubmissionView && !$canAccessSubmissions;
        if ($cantAccessFormView || $cantAccessSubmissionView) {
            if ($canAccessForms) {
                return $this->redirect(UrlHelper::cpUrl('freeform/'.Freeform::VIEW_FORMS));
            }

            if ($canAccessSubmissions) {
                return $this->redirect(UrlHelper::cpUrl('freeform/'.Freeform::VIEW_SUBMISSIONS));
            }

            if ($canAccessNotifications) {
                return $this->redirect(UrlHelper::cpUrl('freeform/'.Freeform::VIEW_NOTIFICATIONS));
            }

            if ($canAccessSettings) {
                return $this->redirect(UrlHelper::cpUrl('freeform/'.Freeform::VIEW_SETTINGS));
            }

            if (Freeform::getInstance()->isPro() && PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS)) {
                return $this->redirect(UrlHelper::cpUrl('freeform/'.Freeform::VIEW_EXPORT_PROFILES));
            }
        }

        return $this->redirect(UrlHelper::cpUrl("freeform/{$defaultView}"));
    }

    public function actionAddEmailTemplate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $errors = [];
        $settings = $this->getSettingsModel();
        $extension = '.twig';

        $templateDirectory = $settings->getAbsoluteEmailTemplateDirectory();
        $templateName = \Craft::$app->request->post('templateName');

        if (!$templateDirectory) {
            $errors[] = Freeform::t('No custom template directory specified in settings');
        } else {
            if ($templateName) {
                $templateName = CraftStringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory.'/'.$templateName.$extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName.$extension]);
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

        return $this->asJson([
            'templateName' => $templateName,
            'errors' => $errors,
        ]);
    }

    public function actionAddSuccessTemplate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $errors = [];
        $settings = $this->getSettingsModel();
        $extension = '.twig';

        $templateDirectory = $settings->getAbsoluteSuccessTemplateDirectory();
        $templateName = \Craft::$app->request->post('templateName');

        if (!$templateDirectory) {
            $errors[] = Freeform::t('No success template directory specified in settings');
        } else {
            if ($templateName) {
                $templateName = CraftStringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory.'/'.$templateName.$extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName.$extension]);
                } else {
                    try {
                        FileHelper::writeToFile($templatePath, $settings->getSuccessTemplateContent());
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
                'errors' => $errors,
            ]
        );
    }

    public function actionSaveSettings()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $settingsService = $this->getSettingsService();
        $readOnly = !$settingsService->isAllowAdminEdit();
        if ($readOnly) {
            return;
        }

        $postData = \Craft::$app->request->post('settings', []);

        if (\array_key_exists('purgableFormIds', $postData)) {
            $purgableFormIds = $postData['purgableFormIds'];
            if ('*' === $purgableFormIds) {
                $postData['purgableFormIds'] = null;
            }
        }

        $oldSettings = $this->getSettingsModel();
        $oldManagedPingerEnabled = isset($postData['managedPingerEnabled']) ? (bool) $oldSettings->managedPingerEnabled : null;
        $oldIntervalSeconds = isset($postData['queuePingMinIntervalMinutes']) ? (int) $oldSettings->queuePingMinIntervalSeconds : null;

        if ($this->getSettingsService()->saveSettings($postData)) {
            \Craft::$app->session->setSuccess(Freeform::t('Freeform settings saved.'));

            if (isset($postData['purgableSubmissionAgeInDays']) || isset($postData['purgableSpamAgeInDays'])) {
                \Craft::$app->cache->delete(SettingsService::CACHE_KEY_PURGE);
            }

            if (isset($postData['managedPingerEnabled']) || isset($postData['queuePingMinIntervalMinutes'])) {
                $settings = $this->getSettingsModel();
                $newManagedPingerEnabled = (bool) $settings->managedPingerEnabled;
                $newIntervalSeconds = (int) $settings->queuePingMinIntervalSeconds;

                if (isset($postData['managedPingerEnabled']) && $oldManagedPingerEnabled !== $newManagedPingerEnabled) {
                    \Craft::$app->queue->push($newManagedPingerEnabled ? new ManagedPingerRegisterJob() : new ManagedPingerDeregisterJob());
                } elseif (isset($postData['queuePingMinIntervalMinutes']) && $oldIntervalSeconds !== $newIntervalSeconds && $newManagedPingerEnabled) {
                    \Craft::$app->queue->push(new ManagedPingerRegisterJob());
                }
            }

            return $this->redirectToPostedUrl();
        }

        $plugin = Freeform::getInstance();
        $errors = $plugin->getSettings()->getErrors();
        \Craft::$app->session->setError(
            implode("\n", FreeformStringHelper::flattenArrayValues($errors))
        );
    }

    public function actionDisablePinger(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $this->requirePostRequest();

        try {
            $settings = Freeform::getInstance()->settings->getSettingsModel();

            // Disable the managed pinger in Freeform settings
            $settings->managedPingerEnabled = false;

            // Save the settings
            if (!\Craft::$app->plugins->savePluginSettings(Freeform::getInstance(), $settings->toArray())) {
                throw new \Exception('Failed to save settings');
            }

            // Queue the deregister job to notify Form Monitor (soft delete)
            \Craft::$app->queue->push(new ManagedPingerDeregisterJob());

            return $this->asJson([
                'success' => true,
                'message' => Freeform::t('Pinger disabled successfully.'),
            ]);
        } catch (\Throwable $e) {
            return $this->asJson([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function actionDeletePinger(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $this->requirePostRequest();

        try {
            $settings = Freeform::getInstance()->settings->getSettingsModel();

            // Disable the managed pinger in Freeform settings
            $settings->managedPingerEnabled = false;

            // Save the settings
            if (!\Craft::$app->plugins->savePluginSettings(Freeform::getInstance(), $settings->toArray())) {
                throw new \Exception('Failed to save settings');
            }

            // Queue the delete job to permanently remove from Form Monitor
            \Craft::$app->queue->push(new ManagedPingerDeleteJob());

            return $this->asJson([
                'success' => true,
                'message' => Freeform::t('Pinger deleted successfully.'),
            ]);
        } catch (\Throwable $e) {
            return $this->asJson([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function actionProvideSetting(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $section = \Craft::$app->request->getSegment(3);

        $formattingTemplateList = [];
        if ($this->getSettingsService()->getSettingsModel()->defaults->includeSampleTemplates) {
            $formattingTemplateList[] = ['optgroup' => Freeform::t('Freeform Templates')];
            foreach ($this->getSettingsService()->getSolspaceFormTemplates() as $formTemplate) {
                $formattingTemplateList[] = [
                    'label' => ucwords($formTemplate->getName()),
                    'value' => $formTemplate->getFileName(),
                ];
            }
        }

        $formattingTemplateList[] = ['optgroup' => Freeform::t('Custom Templates')];
        foreach ($this->getSettingsService()->getCustomFormTemplates() as $formTemplate) {
            $formattingTemplateList[] = [
                'label' => ucwords($formTemplate->getName()),
                'value' => $formTemplate->getFileName(),
            ];
        }

        $settingsService = $this->getSettingsService();
        $readOnly = !$settingsService->isAllowAdminEdit() && $settingsService->isSectionASetting($section);

        $this->view->registerAssetBundle(CodepackBundle::class);
        $this->view->registerAssetBundle(SettingsBundle::class);

        return $this->renderTemplate(
            'freeform/settings/'.($section ? '_'.(string) $section : ''),
            [
                'forms' => $this->getFormsService()->getAllFormNames(),
                'settings' => $this->getSettingsModel(),
                'solspaceTemplates' => $this->getSettingsService()->getSolspaceFormTemplates(),
                'formattingTemplateList' => $formattingTemplateList,
                'readOnly' => $readOnly,
            ]
        );
    }

    private function getSettingsModel(): Settings
    {
        $settingsService = Freeform::getInstance()->settings;

        return $settingsService->getSettingsModel();
    }
}
