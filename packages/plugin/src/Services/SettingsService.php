<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Bundles\Spam\Honeypot\HoneypotProvider;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
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

    public function getCustomErrorMessage(): ?string
    {
        return $this->getSettingsModel()->customErrorMessage;
    }

    public function isFreeformHoneypotEnabled(Form $form = null): bool
    {
        $settingsModel = $this->getSettingsModel();

        $enabled = $settingsModel->freeformHoneypot;
        if (!$enabled) {
            return false;
        }

        if ($settingsModel->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return false;
        }

        if ($form && $form->getProperties()->get(HoneypotProvider::HONEYPOT_DISABLE_KEY, false)) {
            return false;
        }

        return true;
    }

    public function isFreeformHoneypotEnhanced(): bool
    {
        return (bool) $this->getSettingsModel()->freeformHoneypotEnhancement;
    }

    public function isSpamBehaviourSimulatesSuccess(): bool
    {
        return Settings::PROTECTION_SIMULATE_SUCCESS === $this->getSettingsModel()->spamProtectionBehaviour;
    }

    public function isSpamBehaviourDisplayErrors(): bool
    {
        return Settings::PROTECTION_DISPLAY_ERRORS === $this->getSettingsModel()->spamProtectionBehaviour;
    }

    public function isSpamBehaviourReloadForm(): bool
    {
        return Settings::PROTECTION_RELOAD_FORM === $this->getSettingsModel()->spamProtectionBehaviour;
    }

    public function getFieldDisplayOrder(): string
    {
        return $this->getSettingsModel()->fieldDisplayOrder;
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
        return (bool) $this->getSettingsModel()->formSubmitDisable;
    }

    public function isRememberSubmitOrder(): bool
    {
        return (bool) $this->getSettingsModel()->rememberPageSubmitOrder;
    }

    public function isAutoScrollToErrors(): bool
    {
        return (bool) $this->getSettingsModel()->autoScrollToErrors;
    }

    public function isRemoveNewlines(): bool
    {
        return (bool) $this->getSettingsModel()->removeNewlines;
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

        $nav = [
            'general' => ['title' => Freeform::t('General Settings')],
            'form-behavior' => ['title' => Freeform::t('Form Behavior')],
            'form-builder' => ['title' => Freeform::t('Form Builder')],
            'template-manager' => ['title' => Freeform::t('Template Manager')],
            'statuses' => ['title' => Freeform::t('Statuses')],
            'demo-templates' => ['title' => Freeform::t('Demo Templates')],
            'spam' => ['title' => Freeform::t('Spam Protection')],
            'hdapi' => ['heading' => Freeform::t('Integrations')],
            'email-marketing' => ['title' => Freeform::t('Email Marketing')],
            'crm' => ['title' => Freeform::t('CRM')],
            'elements' => ['title' => Freeform::t('Elements')],
            'captchas' => ['title' => Freeform::t('Captchas')],
            // 'payment-gateways' => ['title' => Freeform::t('Payments')],
            'webhooks' => ['title' => Freeform::t('Webhooks')],
            'hdalerts' => ['heading' => Freeform::t('Reliability')],
            'notices-and-alerts' => ['title' => Freeform::t('Notices & Alerts')],
            'error-log' => ['title' => Freeform::t('Error Log <span class="badge">{count}</span>', ['count' => $errorCount])],
            'diagnostics' => ['title' => Freeform::t('Diagnostics')],
            'craft-preflight' => ['title' => Freeform::t('Craft 4 Preflight')],
        ];

        if (version_compare(Freeform::getInstance()->getVersion(), '4.0.0-alpha', '>=')) {
            unset($nav['craft-preflight']);
        }

        if (!$this->isAllowAdminEdit()) {
            unset($nav['hdspam']);
            foreach ($nav as $key => $value) {
                if (!isset($value['heading']) && $this->isSectionASetting($key)) {
                    unset($nav[$key]);
                }
            }
        }

        $event = new RegisterSettingsNavigationEvent($nav);

        $this->trigger(self::EVENT_REGISTER_SETTINGS_NAVIGATION, $event);

        return $event->getNavigation();
    }

    public function isSpamFolderEnabled(): bool
    {
        return $this->getSettingsModel()->spamFolderEnabled;
    }

    public function isAjaxEnabledByDefault(): bool
    {
        return $this->getSettingsModel()->ajaxByDefault;
    }

    public function isSectionASetting(string $sectionName): bool
    {
        $nonSettingSections = [
            'statuses',
            'error-log',
            'diagnostics',
            'email-marketing',
            'crm',
            'payment-gateways',
            'captchas',
            'elements',
            'webhooks',
        ];

        return !\in_array($sectionName, $nonSettingSections, true);
    }

    public function isAllowAdminEdit(): bool
    {
        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            return \Craft::$app->getConfig()->getGeneral()->allowAdminChanges;
        }

        return true;
    }

    public function getFailedNotificationRecipients(): RecipientCollection
    {
        return new RecipientCollection(
            StringHelper::extractSeparatedValues(
                $this->getSettingsModel()->alertNotificationRecipients ?? ''
            )
        );
    }

    public function getDigestRecipients(): RecipientCollection
    {
        return new RecipientCollection(
            StringHelper::extractSeparatedValues(
                $this->getSettingsModel()->digestRecipients ?? ''
            )
        );
    }

    public function getDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->digestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function getClientDigestRecipients(): RecipientCollection
    {
        return new RecipientCollection(
            StringHelper::extractSeparatedValues(
                $this->getSettingsModel()->clientDigestRecipients ?? ''
            )
        );
    }

    public function getClientDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->clientDigestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function isDigestOnlyOnProduction(): bool
    {
        return $this->getSettingsModel()->digestOnlyOnProduction;
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
            $total += $freeform->logger->getLogReader()->count();
        }

        return $total;
    }

    public function saveSettings(array $data): bool
    {
        $plugin = Freeform::getInstance();
        $plugin->setSettings($data);

        return \Craft::$app->plugins->savePluginSettings($plugin, $data);
    }

    public function getPluginJsPath(): string
    {
        return \Yii::getAlias('@freeform/Resources/js/scripts/front-end/plugin/freeform.js');
    }

    public function getPluginCssPath(): string
    {
        return \Yii::getAlias('@freeform/Resources/css/front-end/plugin/freeform.css');
    }

    public function isFormFieldShowOnlyAllowedForms(): bool
    {
        return $this->getSettingsModel()->formFieldShowOnlyAllowedForms;
    }

    private function getTemplatesIn(?string $path): array
    {
        if (!$path || !is_dir($path)) {
            return [];
        }

        $templates = [];

        $fileIterator = (new Finder())
            ->files()
            ->in($path)
            ->sortByName()
            ->name('index.twig')
        ;

        foreach ($fileIterator as $file) {
            $templates[] = new FormTemplate($file->getRealPath(), $path);
        }

        $rootFiles = (new Finder())
            ->files()
            ->in($path)
            ->depth(0)
            ->sortByName()
            ->name('*.twig')
        ;

        foreach ($rootFiles as $file) {
            $templates[] = new FormTemplate($file->getRealPath(), $path);
        }

        return $templates;
    }
}
