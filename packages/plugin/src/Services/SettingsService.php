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

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\FormMonitor;
use Solspace\Freeform\Integrations\Single\Honeypot\Honeypot;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Templates\TemplateLocator;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\Pro\DigestService;
use Symfony\Component\Finder\Finder;

class SettingsService extends BaseService
{
    public const CACHE_KEY_PURGE = 'freeform-purge-cache-key';
    public const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

    public const EVENT_REGISTER_SETTINGS_NAVIGATION = 'registerSettingsNavigation';

    /** @var Settings */
    private static $settingsModel;

    public function getPluginName(): ?string
    {
        return $this->getSettingsModel()->pluginName;
    }

    public function isFreeformHoneypotEnabled(?Form $form = null): bool
    {
        if ($this->isBypassSpamCheckOnLoggedInUsers() && \Craft::$app->getUser()->id) {
            return false;
        }

        if ($form) {
            $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
            $honeypot = $integrationProvider->getSingleton($form, Honeypot::class);

            return (bool) $honeypot;
        }

        return false;
    }

    public function isSpamBehaviorSimulatesSuccess(): bool
    {
        return Settings::PROTECTION_SIMULATE_SUCCESS === $this->getSettingsModel()->spamProtectionBehavior;
    }

    public function isSpamBehaviorDisplayErrors(): bool
    {
        return Settings::PROTECTION_DISPLAY_ERRORS === $this->getSettingsModel()->spamProtectionBehavior;
    }

    public function isSpamBehaviorReloadForm(): bool
    {
        return Settings::PROTECTION_RELOAD_FORM === $this->getSettingsModel()->spamProtectionBehavior;
    }

    public function getFormTemplateDirectory(): ?string
    {
        return $this->getSettingsModel()->getAbsoluteFormTemplateDirectory();
    }

    public function getSuccessTemplateDirectory(): ?string
    {
        return $this->getSettingsModel()->getAbsoluteSuccessTemplateDirectory();
    }

    public function getSolspaceFormTemplateDirectory(): string
    {
        return __DIR__.'/../templates/_templates/formatting';
    }

    /**
     * @return FormTemplate[]
     *
     * @throws \InvalidArgumentException
     */
    public function getSolspaceFormTemplates(): array
    {
        return $this->getTemplatesIn($this->getSolspaceFormTemplateDirectory());
    }

    /**
     * @return FormTemplate[]
     */
    public function getCustomFormTemplates(): array
    {
        return $this->getTemplatesIn($this->getFormTemplateDirectory());
    }

    /**
     * @return FormTemplate[]
     */
    public function getSuccessTemplates(): array
    {
        $templates = [];
        $templateDirectoryPath = $this->getSuccessTemplateDirectory();

        if (!$templateDirectoryPath) {
            return [];
        }

        if (!is_dir($templateDirectoryPath)) {
            return $templates;
        }

        $rootFiles = (new Finder())
            ->files()
            ->in($templateDirectoryPath)
            ->depth(0)
            ->sortByName()
            ->name('*.twig')
        ;

        foreach ($rootFiles as $file) {
            $templates[] = new FormTemplate($file->getRealPath(), $templateDirectoryPath);
        }

        return $templates;
    }

    public function isFooterScripts(): bool
    {
        return Settings::SCRIPT_INSERT_LOCATION_FOOTER === $this->getSettingsModel()->scriptInsertLocation;
    }

    public function isHeaderScripts(): bool
    {
        return Settings::SCRIPT_INSERT_LOCATION_HEADER === $this->getSettingsModel()->scriptInsertLocation;
    }

    public function isFormScripts(): bool
    {
        return Settings::SCRIPT_INSERT_LOCATION_FORM === $this->getSettingsModel()->scriptInsertLocation;
    }

    public function isManualScripts(): bool
    {
        return Settings::SCRIPT_INSERT_LOCATION_MANUAL === $this->getSettingsModel()->scriptInsertLocation;
    }

    public function scriptInsertType(): string
    {
        return $this->getSettingsModel()->scriptInsertType;
    }

    public function isFormSubmitDisable(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->formSubmitDisable);
    }

    public function isRememberSubmitOrder(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->rememberPageSubmitOrder);
    }

    public function isAutoScrollToErrors(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->autoScrollToErrors);
    }

    public function isAutoScroll(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->autoScroll);
    }

    public function isUseIdempotencyKey(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->useIdempotencyKey);
    }

    public function isRemoveNewlines(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->removeNewlines);
    }

    public function isExportLabels(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->exportLabels);
    }

    public function isExportHandlesAsNames(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->exportHandlesAsNames);
    }

    public function isExportTrackedUrlParameters(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->exportTrackedUrlParameters);
    }

    public function isSitesEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->sitesEnabled);
    }

    public function isAbTestsEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->abTests);
    }

    public function isFillWithGet(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->fillWithGet);
    }

    public function isAllowDashesInFieldHandles(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->allowDashesInFieldHandles);
    }

    public function isUpdateSearchIndexes(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->updateSearchIndexes);
    }

    public function getPurgableSubmissionAgeInDays(): ?int
    {
        $age = $this->getSettingsModel()->purgableSubmissionAgeInDays;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return null;
        }

        return $age;
    }

    public function getPurgableSpamAgeInDays(): ?int
    {
        $age = $this->getSettingsModel()->purgableSpamAgeInDays;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return null;
        }

        return $age;
    }

    public function getPurgableUnfinalizedAssetAgeInMinutes(): ?int
    {
        $age = $this->getSettingsModel()->purgableUnfinalizedAssetAgeInMinutes;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return Settings::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES;
        }

        return $age;
    }

    public function isRenderFormHtmlInCpViews(): bool
    {
        return $this->getSettingsModel()->renderFormHtmlInCpViews;
    }

    public function getQueuePriority(): ?int
    {
        return $this->getSettingsModel()->queuePriority;
    }

    public function getQueuePingToken(): ?string
    {
        return $this->getSettingsModel()->queuePingToken;
    }

    public function isManagedPingerEnabled(): bool
    {
        return (bool) $this->getSettingsModel()->managedPingerEnabled;
    }

    public function disablePinging(): void
    {
        $settings = $this->getSettingsModel();
        $settings->managedPingerEnabled = false;

        \Craft::$app->plugins->savePluginSettings(Freeform::getInstance(), $settings->toArray());
    }

    public function getSettingsModel(): Settings
    {
        if (null === self::$settingsModel) {
            $plugin = Freeform::getInstance();
            self::$settingsModel = $plugin->getSettings();
        }

        return self::$settingsModel;
    }

    public function getSettingsNavigation(): array
    {
        $errorCount = Freeform::getInstance()->logger->getLogReader()->count();
        $integrationsCount = Freeform::getInstance()->logger->getLogReader(IntegrationLoggerProvider::LOG_FILE)->count();
        $emailCount = Freeform::getInstance()->logger->getLogReader(NotificationLoggerProvider::LOG_FILE)->count();
        $solspaceAiNavItem = null;
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS)) {
            $plugin = Freeform::getInstance();
            $solspaceAiNavItem = ['title' => Freeform::t('SolspaceAI')];
        }

        $nav = [
            'general' => ['title' => Freeform::t('General Settings')],
            'form-behavior' => ['title' => Freeform::t('Form Behavior')],
            'queue-processing' => ['title' => Freeform::t('Queue Processing')],
            'form-builder' => ['title' => Freeform::t('Form Builder')],
            'limited-users' => ['title' => Freeform::t('Limited Users')],
            'template-manager' => ['title' => Freeform::t('Template Manager')],
            'pdf-templates' => ['title' => Freeform::t('PDF Templates')],
            'statuses' => ['title' => Freeform::t('Statuses')],
            'demo-templates' => ['title' => Freeform::t('Demo Templates')],
            'spam' => ['title' => Freeform::t('Spam Protection')],
            'ai' => $solspaceAiNavItem,
            'hdalerts' => ['heading' => Freeform::t('Reliability')],
            'notices-and-alerts' => ['title' => Freeform::t('Notices & Alerts')],
            'diagnostics' => ['title' => Freeform::t('Diagnostics')],
            'hdlogs' => ['heading' => Freeform::t('Logs')],
            'error-log' => ['title' => Freeform::t('Errors <span class="badge">{count}</span>', ['count' => $errorCount])],
            'integrations-log' => ['title' => Freeform::t('Integrations <span class="badge">{count}</span>', ['count' => $integrationsCount])],
            'email-log' => ['title' => Freeform::t('Emails <span class="badge">{count}</span>', ['count' => $emailCount])],
        ];

        $nav = array_filter($nav);

        $event = new RegisterSettingsNavigationEvent($nav);
        $this->trigger(self::EVENT_REGISTER_SETTINGS_NAVIGATION, $event);

        return $event->getNavigation();
    }

    public function isSpamFolderEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->spamFolderEnabled);
    }

    public function isDisplayFeed(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->displayFeed);
    }

    public function isAjaxEnabledByDefault(): bool
    {
        return $this->getSettingsModel()->defaults->settings->processing->ajax->getValue();
    }

    public function isSectionASetting(string $sectionName): bool
    {
        $nonSettingSections = [
            'limited-users',
            'statuses',
            'pdf-templates',
            'error-log',
            'integrations-log',
            'email-log',
            'diagnostics',
            'integrations/email-marketing',
            'integrations/crm',
            'integrations/payment-gateways',
            'integrations/captchas',
            'integrations/spam-blocking',
            'integrations/elements',
            'integrations/webhooks',
            'integrations/single',
            'integrations/other',
        ];

        return !\in_array($sectionName, $nonSettingSections, true);
    }

    public function isAllowAdminEdit(): bool
    {
        return \Craft::$app->getConfig()->getGeneral()->allowAdminChanges;

        return true;
    }

    public function getFailedNotificationRecipients(): RecipientCollection
    {
        return $this->getRecipientCollection($this->getSettingsModel()->alertNotificationRecipients ?? '');
    }

    public function isErrorNotificationEnabled(): bool
    {
        return $this->getErrorNotificationRecipients()->count() > 0;
    }

    public function getErrorNotificationRecipients(): RecipientCollection
    {
        return $this->getRecipientCollection($this->getSettingsModel()->errorNotificationRecipients ?? '');
    }

    public function getDigestRecipients(): RecipientCollection
    {
        return $this->getRecipientCollection($this->getSettingsModel()->digestRecipients ?? '');
    }

    public function getDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->digestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function getClientDigestRecipients(): RecipientCollection
    {
        return $this->getRecipientCollection($this->getSettingsModel()->clientDigestRecipients ?? '');
    }

    public function getClientDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->clientDigestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function isDigestOnlyOnProduction(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->digestOnlyOnProduction);
    }

    public function getBadgeCount(): ?int
    {
        $type = $this->getSettingsModel()->badgeType;
        if (!$type) {
            return null;
        }

        $freeform = Freeform::getInstance();
        if ('submissions' === $type) {
            return $freeform->submissions->getSubmissionCount();
        }

        if ('spam' === $type) {
            return $freeform->spamSubmissions->getSubmissionCount(null, null, true);
        }

        $total = 0;
        if ('all' === $type || 'notices' === $type) {
            $total += $freeform->feed->getUnreadCount();
        }

        if ('all' === $type || 'errors' === $type) {
            $total += $freeform->logger->getCombinedLogLineCount(['error']);
        }

        return $total;
    }

    public function saveSettings(array $data): bool
    {
        // Normalize pinging-related settings before saving
        $data = $this->normalizePingingSettings($data);

        $plugin = Freeform::getInstance();
        $plugin->setSettings($data);

        $allSettings = $plugin->getSettings()->toArray();

        $saved = \Craft::$app->plugins->savePluginSettings($plugin, $allSettings);

        if ($saved) {
            self::$settingsModel = null;
        }

        return $saved;
    }

    public function getPluginJsPath(): string
    {
        return 'js/scripts/front-end/plugin/freeform.js';
    }

    public function getPluginCssPath(): string
    {
        return 'css/front-end/plugin/freeform.css';
    }

    public function isFormFieldShowOnlyAllowedForms(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->formFieldShowOnlyAllowedForms);
    }

    public function isNotificationQueueEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->useQueueForEmailNotifications);
    }

    public function isIntegrationQueueEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->useQueueForIntegrations);
    }

    public function isAiFieldQueueEnabled(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->useQueueForAiFields);
    }

    public function isBypassSpamCheckOnLoggedInUsers(): bool
    {
        return BooleanHelper::normalize($this->getSettingsModel()->bypassSpamCheckOnLoggedInUsers);
    }

    public function isFormMonitorEnabledAndAuthorized(): bool
    {
        try {
            $record = IntegrationRecord::find()
                ->where(['class' => FormMonitor::class])
                ->one()
            ;

            if (!$record || !$record->enabled) {
                return false;
            }

            $model = Freeform::getInstance()->integrations->getById((int) $record->id);
            if (!$model) {
                return false;
            }

            $integration = $model->getIntegrationObject();
            if (!$integration instanceof FormMonitor) {
                return false;
            }

            return (bool) ($integration->getApiKey() && $integration->getRequestToken());
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function normalizePingingSettings(array $data): array
    {
        // Auto-manage endpoint when managed pinger is toggled
        if (\array_key_exists('managedPingerEnabled', $data)) {
            $managed = (bool) $data['managedPingerEnabled'];
            if ($managed) {
                // Ensure token exists
                $existingToken = $this->getSettingsModel()->queuePingToken;

                if (empty($data['queuePingToken']) && !$existingToken) {
                    $data['queuePingToken'] = \Craft::$app->getSecurity()->generateRandomString(32);
                }
            }
        }

        // Convert UI minutes to seconds if provided
        if (\array_key_exists('queuePingMinIntervalMinutes', $data)) {
            $minutes = (int) $data['queuePingMinIntervalMinutes'];
            if ($minutes > 0) {
                $data['queuePingMinIntervalSeconds'] = max(5, $minutes * 60);
            }
            unset($data['queuePingMinIntervalMinutes']);
        }

        return $data;
    }

    private function getTemplatesIn(?string $path): array
    {
        if (!$path) {
            return [];
        }

        $locator = \Craft::$container->get(TemplateLocator::class);

        return $locator->locate($path);
    }

    private function getRecipientCollection(string $emails): RecipientCollection
    {
        $recipients = array_map(
            static fn (string $email) => new Recipient($email),
            StringHelper::extractSeparatedValues($emails)
        );

        return new RecipientCollection($recipients);
    }
}
