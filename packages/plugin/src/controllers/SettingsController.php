<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
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
use Solspace\Freeform\Library\Codepack\MessageTemplateSamples;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Helpers\DefaultViewHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Library\Integrations\ExternalIntegrations;
use Solspace\Freeform\Library\Integrations\IntegrationIconsAsset;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use Solspace\Freeform\Resources\Bundles\SettingsBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\web\Response;

class SettingsController extends BaseController
{
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

    public function actionFormMonitor(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        if ($this->getSettingsService()->isFormMonitorEnabledAndAuthorized()) {
            return $this->redirect(UrlHelper::cpUrl('freeform/integrations/single/FormMonitor'));
        }

        $this->view->registerAssetBundle(SettingsBundle::class);

        return $this->renderTemplate('freeform/settings/form-monitor', [
            'readOnly' => false,
        ]);
    }

    public function actionDefaultView(): Response
    {
        $plugin = Freeform::getInstance();
        $canAccessSubmissions = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $defaultView = DefaultViewHelper::resolve($this->getSettingsModel()->defaultView, [
            Freeform::VIEW_FORMS => PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS),
            Freeform::VIEW_SUBMISSIONS => $canAccessSubmissions,
            Freeform::VIEW_NOTIFICATIONS => PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS),
            Freeform::VIEW_SETTINGS => PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS),
            Freeform::VIEW_EXPORT_PROFILES => $plugin->isPro() && PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS),
            'spam' => $canAccessSubmissions && $plugin->settings->isSpamFolderEnabled(),
            'ab-tests' => $plugin->isPro() && $plugin->settings->isAbTestsEnabled() && PermissionHelper::checkPermission(Freeform::PERMISSION_AB_ACCESS),
        ]);

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
        $sampleId = (string) \Craft::$app->request->post('sample', '');
        $sample = $sampleId ? MessageTemplateSamples::get('email', $sampleId) : null;
        $templateName = $sample['fileName'] ?? \Craft::$app->request->post('templateName');

        if ($sampleId && !$sample) {
            $errors[] = Freeform::t('Choose a valid sample template');
        } elseif (!$templateDirectory) {
            $errors[] = Freeform::t('No custom template directory specified in settings');
        } else {
            if ($templateName && preg_match('/^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/D', (string) $templateName)) {
                $templateName = CraftStringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory.'/'.$templateName.$extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName.$extension]);
                } else {
                    try {
                        FileHelper::writeToFile($templatePath, $settings->getEmailTemplateContent($sampleId ?: null));
                    } catch (FreeformException $exception) {
                        $errors[] = $exception->getMessage();
                    }
                }
            } else {
                $errors[] = Freeform::t('Enter a valid template name');
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
        $sampleId = (string) \Craft::$app->request->post('sample', '');
        $sample = $sampleId ? MessageTemplateSamples::get('success', $sampleId) : null;
        $templateName = $sample['fileName'] ?? \Craft::$app->request->post('templateName');

        if ($sampleId && !$sample) {
            $errors[] = Freeform::t('Choose a valid sample template');
        } elseif (!$templateDirectory) {
            $errors[] = Freeform::t('No success template directory specified in settings');
        } else {
            if ($templateName && preg_match('/^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/D', (string) $templateName)) {
                $templateName = CraftStringHelper::toSnakeCase($templateName);

                $templatePath = $templateDirectory.'/'.$templateName.$extension;
                if (file_exists($templatePath)) {
                    $errors[] = Freeform::t("Template '{name}' already exists", ['name' => $templateName.$extension]);
                } else {
                    try {
                        FileHelper::writeToFile($templatePath, $settings->getSuccessTemplateContent($sampleId ?: null));
                    } catch (FreeformException $exception) {
                        $errors[] = $exception->getMessage();
                    }
                }
            } else {
                $errors[] = Freeform::t('Enter a valid template name');
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
        if (\in_array($section, ['content-integrations', 'external-integrations'], true)
            && version_compare(\Craft::$app->getVersion(), '5.0', '<')) {
            return $this->redirect(UrlHelper::cpUrl('freeform/settings/general'));
        }

        if ('external-integrations' === $section) {
            return $this->redirect(UrlHelper::cpUrl('freeform/settings/content-integrations'));
        }

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
        $integrationIcons = 'content-integrations' === $section
            ? $this->view->registerAssetBundle(IntegrationIconsAsset::class)
            : null;
        $integrationIconUrls = [];
        if ($integrationIcons) {
            foreach (array_keys(ExternalIntegrations::DEFINITIONS + ExternalIntegrations::FIELD_CONTAINERS) as $id) {
                $integrationIconUrls[$id] = $this->view->getAssetManager()->getAssetUrl($integrationIcons, 'plugins/'.$id.'.svg', true);
            }
        }

        return $this->renderTemplate(
            'freeform/settings/'.($section ? '_'.(string) $section : ''),
            [
                'forms' => $this->getFormsService()->getAllFormNames(),
                'settings' => $this->getSettingsModel(),
                'solspaceTemplates' => $this->getSettingsService()->getSolspaceFormTemplates(),
                'formattingTemplateList' => $formattingTemplateList,
                'successTemplateSamples' => MessageTemplateSamples::options('success'),
                'emailTemplateSamples' => MessageTemplateSamples::options('email'),
                'aiIntegrations' => 'general' === $section && Freeform::getInstance()->isPro() ? $this->getIntegrationsService()->getEnabledAiIntegrationOptions() : [],
                'readOnly' => $readOnly,
                'externalIntegrations' => 'content-integrations' === $section ? (new ExternalIntegrations())->getCatalog() : [],
                'contentFieldContainers' => 'content-integrations' === $section ? (new ExternalIntegrations())->getFieldContainers() : [],
                'contentFieldContainerGuideUrl' => 'https://github.com/solspace/craft-freeform/blob/v5/packages/plugin/src/Library/Integrations/README.md#matrix-neo-and-content-block-fields',
                'externalIntegrationIconUrls' => $integrationIconUrls,
                'externalIntegrationDefaultIconSvg' => 'content-integrations' === $section ? (new ExternalIntegrations())->getDefaultIconSvg() : '',
            ]
        );
    }

    private function getSettingsModel(): Settings
    {
        $settingsService = Freeform::getInstance()->settings;

        return $settingsService->getSettingsModel();
    }
}
