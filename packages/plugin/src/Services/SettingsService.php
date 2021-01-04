<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\db\Table;
use Solspace\Commons\Helpers\ComparisonHelper;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\IpUtils;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\Pro\DigestService;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class SettingsService extends BaseService
{
    const CACHE_KEY_PURGE = 'freeform-purge-cache-key';
    const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

    const EVENT_REGISTER_SETTINGS_NAVIGATION = 'registerSettingsNavigation';

    /** @var Settings */
    private static $settingsModel;

    /**
     * @return null|string
     */
    public function getPluginName()
    {
        return $this->getSettingsModel()->pluginName;
    }

    /**
     * @return null|string
     */
    public function getCustomErrorMessage()
    {
        return $this->getSettingsModel()->customErrorMessage;
    }

    public function isFreeformHoneypotEnabled(): bool
    {
        return (bool) $this->getSettingsModel()->freeformHoneypot;
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

    public function getFormTemplateDirectory(): string
    {
        return $this->getSettingsModel()->formTemplateDirectory;
    }

    public function getSolspaceFormTemplateDirectory(): string
    {
        return __DIR__.'/../templates/_defaultFormTemplates';
    }

    /**
     * Mark the tutorial as finished.
     */
    public function finishTutorial(): bool
    {
        $plugin = Freeform::getInstance();
        if (\Craft::$app->plugins->savePluginSettings($plugin, ['showTutorial' => false])) {
            return true;
        }

        return false;
    }

    /**
     * @throws \InvalidArgumentException
     *
     * @return FormTemplate[]
     */
    public function getSolspaceFormTemplates(): array
    {
        $templateDirectoryPath = $this->getSolspaceFormTemplateDirectory();

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs->files()->in($templateDirectoryPath)->name('*.html');
        $templates = [];

        foreach ($fileIterator as $file) {
            $templates[] = new FormTemplate($file->getRealPath());
        }

        return $templates;
    }

    /**
     * @return FormTemplate[]
     */
    public function getCustomFormTemplates(): array
    {
        $templates = [];
        foreach ($this->getSettingsModel()->listTemplatesInFormTemplateDirectory() as $path => $name) {
            $templates[] = new FormTemplate($path);
        }

        return $templates;
    }

    public function isDbEmailTemplateStorage(): bool
    {
        $settings = $this->getSettingsModel();

        return !$settings->emailTemplateDirectory || Settings::EMAIL_TEMPLATE_STORAGE_DB === $settings->emailTemplateStorage;
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

    public function isFormSubmitDisable(): bool
    {
        return (bool) $this->getSettingsModel()->formSubmitDisable;
    }

    public function isAutoScrollToErrors(): bool
    {
        return (bool) $this->getSettingsModel()->autoScrollToErrors;
    }

    public function isRemoveNewlines(): bool
    {
        return (bool) $this->getSettingsModel()->removeNewlines;
    }

    /**
     * @return null|int
     */
    public function getPurgableSubmissionAgeInDays()
    {
        $age = $this->getSettingsModel()->purgableSubmissionAgeInDays;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return null;
        }

        return (int) $age;
    }

    /**
     * @return null|int
     */
    public function getPurgableSpamAgeInDays()
    {
        $age = $this->getSettingsModel()->purgableSpamAgeInDays;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return null;
        }

        return (int) $age;
    }

    /**
     * @return null|int
     */
    public function getPurgableUnfinalizedAssetAgeInMinutes()
    {
        $age = $this->getSettingsModel()->purgableUnfinalizedAssetAgeInMinutes;

        if (null === $age || '' === $age || (int) $age <= 0) {
            return Settings::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES;
        }

        return (int) $age;
    }

    public function isRenderFormHtmlInCpViews(): bool
    {
        return $this->getSettingsModel()->renderFormHtmlInCpViews;
    }

    public function checkSubmissionForSpam(FormValidateEvent $event)
    {
        static $loaded;
        static $emails;
        static $emailsMessage;
        static $showEmailsErrorBelowFields;
        static $keywords;
        static $keywordsMessage;
        static $showKeywordsErrorBelowFields;
        static $isSpamCheckNecessary;

        $form = $event->getForm();

        if ($this->isMinimumSubmissionTimePassed($form)) {
            $event->getForm()->markAsSpam(SpamReason::TYPE_MINIMUM_SUBMIT_TIME, 'Minimum submit time check failed');

            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Sorry, we cannot accept your submission at this time. Not enough time has passed before submitting the form.'));
            }

            return;
        }

        if ($this->isMaximumSubmissionTimePassed($form)) {
            $event->getForm()->markAsSpam(SpamReason::TYPE_MAXIMUM_SUBMIT_TIME, 'Maximum submit time check failed');

            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Sorry, we cannot accept your submission at this time. Too much time has passed before submitting the form.'));
            }

            return;
        }

        if (null === $loaded) {
            $keywords = $this->getSettingsModel()->getBlockedKeywords();
            $keywordsMessage = $this->getSettingsModel()->blockedKeywordsError;
            $showKeywordsErrorBelowFields = $this->getSettingsModel()->showErrorsForBlockedKeywords;
            $emails = $this->getSettingsModel()->getBlockedEmails();
            $emailsMessage = $this->getSettingsModel()->blockedEmailsError;
            $showEmailsErrorBelowFields = $this->getSettingsModel()->showErrorsForBlockedEmails;
            $isSpamCheckNecessary = !empty($keywords) || !empty($emails);

            $loaded = true;
        }

        if (!$isSpamCheckNecessary) {
            return;
        }

        $spamKeywordTypes = [
            FieldInterface::TYPE_NUMBER,
            FieldInterface::TYPE_PHONE,
            FieldInterface::TYPE_REGEX,
            FieldInterface::TYPE_TEXT,
            FieldInterface::TYPE_TEXTAREA,
            FieldInterface::TYPE_CONFIRMATION,
            FieldInterface::TYPE_WEBSITE,
        ];

        $form = $event->getForm();
        foreach ($form->getLayout()->getPages() as $page) {
            foreach ($page->getFields() as $field) {
                if ($keywords && \in_array($field->getType(), $spamKeywordTypes, true)) {
                    foreach ($keywords as $keyword) {
                        if (ComparisonHelper::stringContainsWildcardKeyword($keyword, $field->getValueAsString())) {
                            $event->getForm()->markAsSpam(
                                SpamReason::TYPE_BLOCKED_KEYWORDS,
                                sprintf(
                                    'Field "%s" contains a blocked keyword "%s" in the string "%s"',
                                    $field->getHandle(),
                                    $keyword,
                                    $field->getValueAsString()
                                )
                            );

                            if ($this->isSpamBehaviourDisplayErrors()) {
                                $event->getForm()->addError(Freeform::t('Form contains a restricted keyword'));
                            }

                            if ($showKeywordsErrorBelowFields) {
                                $field->addError(
                                    Freeform::t(
                                        $keywordsMessage,
                                        [
                                            'value' => $field->getValueAsString(),
                                            'keyword' => $keyword,
                                        ]
                                    )
                                );
                            }

                            break;
                        }
                    }
                }

                if ($emails && $field instanceof EmailField) {
                    foreach ($field->getValue() as $value) {
                        foreach ($emails as $email) {
                            if (ComparisonHelper::stringContainsWildcardKeyword($email, $value)) {
                                $event->getForm()->markAsSpam(
                                    SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                                    sprintf(
                                        'Email field "%s" contains a blocked email address "%s"',
                                        $field->getHandle(),
                                        $email
                                    )
                                );

                                if ($this->isSpamBehaviourDisplayErrors()) {
                                    $event->getForm()->addError(Freeform::t('Form contains a blocked email'));
                                }

                                if ($showEmailsErrorBelowFields) {
                                    $field->addError(Freeform::t($emailsMessage, ['email' => $value]));
                                }

                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    public function checkBlockedIps(FormValidateEvent $event)
    {
        static $shouldCheckIp;
        static $spamIps;

        if (null === $shouldCheckIp) {
            $spamIps = $this->getSettingsModel()->getBlockedIpAddresses();
            $shouldCheckIp = !empty($spamIps);
        }

        if (!$shouldCheckIp) {
            return;
        }

        $remoteIp = \Craft::$app->request->getRemoteIP();
        if (IpUtils::checkIp($remoteIp, $spamIps)) {
            $event->getForm()->markAsSpam(
                SpamReason::TYPE_BLOCKED_IP,
                sprintf(
                    'Form submitted by a blocked IP "%s"',
                    $remoteIp
                )
            );
            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Your IP has been blocked'));
            }
        }
    }

    public function throttleSubmissions(FormValidateEvent $event)
    {
        static $throttleCount, $interval;

        if (null === $throttleCount) {
            $throttleCount = (int) $this->getSettingsModel()->submissionThrottlingCount;
            if (Settings::THROTTLING_TIME_FRAME_MINUTES === $this->getSettingsModel()->submissionThrottlingTimeFrame) {
                $interval = 'minutes';
            } else {
                $interval = 'seconds';
            }
        }

        if ($throttleCount) {
            $form = $event->getForm();

            $date = new \DateTime("-1 {$interval}", new \DateTimeZone('UTC'));
            $date = $date->format('Y-m-d H:i:s');

            $submissions = Submission::TABLE;

            $query = (new Query())
                ->select("COUNT({$submissions}.[[id]])")
                ->from($submissions)
                ->where(["{$submissions}.[[formId]]" => $form->getId()])
                ->andWhere("{$submissions}.[[dateCreated]] > :date", ['date' => $date])
            ;

            if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
                $elements = Table::ELEMENTS;
                $query->innerJoin(
                    $elements,
                    "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
                );
            }

            $submissionCount = (int) $query->scalar();

            if ($throttleCount <= $submissionCount) {
                $form->addError(Freeform::t('There was an error processing your submission. Please try again later.'));
            }
        }
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
            'form-builder' => ['title' => Freeform::t('Form Builder Settings')],
            'formatting-templates' => ['title' => Freeform::t('Formatting Templates')],
            'email-templates' => ['title' => Freeform::t('Email Templates')],
            'statuses' => ['title' => Freeform::t('Statuses')],
            'demo-templates' => ['title' => Freeform::t('Demo Templates')],
            'hdspam' => ['heading' => Freeform::t('Spam')],
            'spam' => ['title' => Freeform::t('Spam Settings')],
            'hdapi' => ['heading' => Freeform::t('API Integrations')],
            'mailing-lists' => ['title' => Freeform::t('Mailing Lists')],
            'crm' => ['title' => Freeform::t('CRM')],
            'payment-gateways' => ['title' => Freeform::t('Payments')],
            'webhooks' => ['title' => Freeform::t('Webhooks')],
            'hdalerts' => ['heading' => Freeform::t('Reliability')],
            'notices-and-alerts' => ['title' => Freeform::t('Notices & Alerts')],
            'error-log' => ['title' => Freeform::t('Error Log <span class="badge">{count}</span>', ['count' => $errorCount])],
        ];

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
        return (bool) $this->getSettingsModel()->spamFolderEnabled;
    }

    public function isAjaxEnabledByDefault(): bool
    {
        return (bool) $this->getSettingsModel()->ajaxByDefault;
    }

    public function isSectionASetting(string $sectionName): bool
    {
        $nonSettingSections = [
            'statuses',
            'error-log',
            'mailing-lists',
            'crm',
            'payment-gateways',
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

    public function isOldFreeformInstalled(): bool
    {
        $paths = [
            '/solspace/craft3-freeform',
            '/solspace/craft3-freeform-pro',
            '/solspace/craft3-freeform-payments',
        ];

        if (\defined('CRAFT_VENDOR_PATH')) {
            $vendorPath = CRAFT_VENDOR_PATH;
        } elseif (\defined('CRAFT_BASE_PATH')) {
            $vendorPath = CRAFT_BASE_PATH.'/vendor';
        } else {
            return false;
        }

        $hasOldFreeform = false;
        foreach ($paths as $path) {
            if (is_dir($vendorPath.$path)) {
                $hasOldFreeform = true;
            }
        }

        return $hasOldFreeform;
    }

    public function getFailedNotificationRecipients(): array
    {
        return StringHelper::extractSeparatedValues($this->getSettingsModel()->alertNotificationRecipients ?? '');
    }

    public function getDigestRecipients(): array
    {
        return StringHelper::extractSeparatedValues($this->getSettingsModel()->digestRecipients ?? '');
    }

    public function getDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->digestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function getClientDigestRecipients(): array
    {
        return StringHelper::extractSeparatedValues($this->getSettingsModel()->clientDigestRecipients ?? '');
    }

    public function getClientDigestFrequency(): int
    {
        return (int) ($this->getSettingsModel()->clientDigestFrequency ?? DigestService::FREQUENCY_WEEKLY_MONDAYS);
    }

    public function isDigestOnlyOnProduction(): bool
    {
        return (bool) $this->getSettingsModel()->digestOnlyOnProduction;
    }

    public function getBadgeCount()
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

    private function isMinimumSubmissionTimePassed(Form $form): bool
    {
        $initTime = $form->getInitTime();
        $timeFormAlive = time() - $initTime;

        $minTime = $this->getSettingsModel()->minimumSubmitTime;

        return $minTime && $timeFormAlive <= $minTime;
    }

    private function isMaximumSubmissionTimePassed(Form $form): bool
    {
        $initTime = $form->getInitTime();
        $timeFormAlive = time() - $initTime;

        $maxTime = $this->getSettingsModel()->formSubmitExpiration;

        return $maxTime && $timeFormAlive >= $maxTime * 60;
    }
}
