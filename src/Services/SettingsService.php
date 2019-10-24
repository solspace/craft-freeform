<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\db\Table;
use Solspace\Commons\Helpers\ComparisonHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Library\Helpers\IpUtils;
use Solspace\Freeform\Models\Settings;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

class SettingsService extends BaseService
{
    const EVENT_REGISTER_SETTINGS_NAVIGATION = 'registerSettingsNavigation';

    /** @var Settings */
    private static $settingsModel;

    /**
     * @return string|null
     */
    public function getPluginName()
    {
        return $this->getSettingsModel()->pluginName;
    }

    /**
     * @return string|null
     */
    public function getCustomErrorMessage()
    {
        return $this->getSettingsModel()->customErrorMessage;
    }

    /**
     * @return bool
     */
    public function isFreeformHoneypotEnabled(): bool
    {
        return (bool) $this->getSettingsModel()->freeformHoneypot;
    }

    /**
     * @return bool
     */
    public function isFreeformHoneypotEnhanced(): bool
    {
        return (bool) $this->getSettingsModel()->freeformHoneypotEnhancement;
    }

    /**
     * @return bool
     */
    public function isSpamBehaviourSimulatesSuccess(): bool
    {
        return $this->getSettingsModel()->spamProtectionBehaviour === Settings::PROTECTION_SIMULATE_SUCCESS;
    }

    /**
     * @return bool
     */
    public function isSpamBehaviourDisplayErrors(): bool
    {
        return $this->getSettingsModel()->spamProtectionBehaviour === Settings::PROTECTION_DISPLAY_ERRORS;
    }

    /**
     * @return bool
     */
    public function isSpamBehaviourReloadForm(): bool
    {
        return $this->getSettingsModel()->spamProtectionBehaviour === Settings::PROTECTION_RELOAD_FORM;
    }

    /**
     * @return string
     */
    public function getFieldDisplayOrder(): string
    {
        return $this->getSettingsModel()->fieldDisplayOrder;
    }

    /**
     * @return string
     */
    public function getFormTemplateDirectory(): string
    {
        return $this->getSettingsModel()->formTemplateDirectory;
    }

    /**
     * @return string
     */
    public function getSolspaceFormTemplateDirectory(): string
    {
        return __DIR__ . '/../templates/_defaultFormTemplates';
    }

    /**
     * Mark the tutorial as finished
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
     * @return FormTemplate[]
     * @throws \InvalidArgumentException
     */
    public function getSolspaceFormTemplates(): array
    {
        $templateDirectoryPath = $this->getSolspaceFormTemplateDirectory();

        $fs = new Finder();
        /** @var SplFileInfo[] $fileIterator */
        $fileIterator = $fs->files()->in($templateDirectoryPath)->name('*.html');
        $templates    = [];

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

    /**
     * @return bool
     */
    public function isDbEmailTemplateStorage(): bool
    {
        $settings = $this->getSettingsModel();

        return !$settings->emailTemplateDirectory || $settings->emailTemplateStorage === Settings::EMAIL_TEMPLATE_STORAGE_DB;
    }

    /**
     * @return bool
     */
    public function isFooterScripts(): bool
    {
        return $this->getSettingsModel()->scriptInsertLocation === Settings::SCRIPT_INSERT_LOCATION_FOOTER;
    }

    /**
     * @return bool
     */
    public function isFormScripts(): bool
    {
        return $this->getSettingsModel()->scriptInsertLocation === Settings::SCRIPT_INSERT_LOCATION_FORM;
    }

    /**
     * @return bool
     */
    public function isManualScripts(): bool
    {
        return $this->getSettingsModel()->scriptInsertLocation === Settings::SCRIPT_INSERT_LOCATION_MANUAL;
    }

    /**
     * @return bool
     */
    public function isFormSubmitDisable(): bool
    {
        return (bool) $this->getSettingsModel()->formSubmitDisable;
    }

    /**
     * @return bool
     */
    public function isAutoScrollToErrors(): bool
    {
        return (bool) $this->getSettingsModel()->autoScrollToErrors;
    }

    /**
     * @return bool
     */
    public function isRemoveNewlines(): bool
    {
        return (bool) $this->getSettingsModel()->removeNewlines;
    }

    /**
     * @return int|null
     */
    public function getPurgableSubmissionAgeInDays()
    {
        $age = (int) $this->getSettingsModel()->purgableSubmissionAgeInDays;

        if (!$age || $age < SubmissionsService::MIN_PURGE_AGE) {
            return null;
        }

        return $age;
    }

    /**
     * @return int|null
     */
    public function getPurgableSpamAgeInDays()
    {
        $age = (int) $this->getSettingsModel()->purgableSpamAgeInDays;

        if (!$age || $age < SpamSubmissionsService::MIN_PURGE_AGE) {
            return null;
        }

        return $age;
    }

    public function isRenderFormHtmlInCpViews(): bool
    {
        return $this->getSettingsModel()->renderFormHtmlInCpViews;
    }

    /**
     * @param FormValidateEvent $event
     */
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
            $event->getForm()->setMarkedAsSpam(true);

            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Sorry, we cannot accept your submission at this time. Not enough time has passed before submitting the form.'));
            }

            return;
        }

        if ($this->isMaximumSubmissionTimePassed($form)) {
            $event->getForm()->setMarkedAsSpam(true);

            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Sorry, we cannot accept your submission at this time. Too much time has passed before submitting the form.'));
            }

            return;
        }

        if (null === $loaded) {
            $keywords                     = $this->getSettingsModel()->getBlockedKeywords();
            $keywordsMessage              = $this->getSettingsModel()->blockedKeywordsError;
            $showKeywordsErrorBelowFields = $this->getSettingsModel()->showErrorsForBlockedKeywords;
            $emails                       = $this->getSettingsModel()->getBlockedEmails();
            $emailsMessage                = $this->getSettingsModel()->blockedEmailsError;
            $showEmailsErrorBelowFields   = $this->getSettingsModel()->showErrorsForBlockedEmails;
            $isSpamCheckNecessary         = !empty($keywords) || !empty($emails);

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
                            $event->getForm()->setMarkedAsSpam(true);

                            if ($this->isSpamBehaviourDisplayErrors()) {
                                $event->getForm()->addError(Freeform::t('Form contains a restricted keyword'));
                            }

                            if ($showKeywordsErrorBelowFields) {
                                $field->addError(
                                    Freeform::t(
                                        $keywordsMessage,
                                        [
                                            'value'   => $field->getValueAsString(),
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
                                $event->getForm()->setMarkedAsSpam(true);

                                if ($this->isSpamBehaviourDisplayErrors()) {
                                    $event->getForm()->addError(Freeform::t('Form contains a blacklisted email'));
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

    /**
     * @param FormValidateEvent $event
     */
    public function checkBlacklistedIps(FormValidateEvent $event)
    {
        static $shouldCheckIp;
        static $spamIps;

        if (null === $shouldCheckIp) {
            $spamIps       = $this->getSettingsModel()->getBlockedIpAddresses();
            $shouldCheckIp = !empty($spamIps);
        }

        if (!$shouldCheckIp) {
            return;
        }

        $remoteIp = \Craft::$app->request->getRemoteIP();
        if (IpUtils::checkIp($remoteIp, $spamIps)) {
            $event->getForm()->setMarkedAsSpam(true);
            if ($this->isSpamBehaviourDisplayErrors()) {
                $event->getForm()->addError(Freeform::t('Your IP has been blacklisted'));
            }
        }
    }

    /**
     * @param FormValidateEvent $event
     */
    public function throttleSubmissions(FormValidateEvent $event)
    {
        static $throttleCount, $interval;

        if (null === $throttleCount) {
            $throttleCount = (int) $this->getSettingsModel()->submissionThrottlingCount;
            if ($this->getSettingsModel()->submissionThrottlingTimeFrame === Settings::THROTTLING_TIME_FRAME_MINUTES) {
                $interval = 'minutes';
            } else {
                $interval = 'seconds';
            }
        }

        if ($throttleCount) {
            $form = $event->getForm();

            $date = new \DateTime("-1 $interval", new \DateTimeZone('UTC'));
            $date = $date->format('Y-m-d H:i:s');

            $submissions = Submission::TABLE;

            $query = (new Query())
                ->select("COUNT($submissions.[[id]])")
                ->from($submissions)
                ->where(["$submissions.[[formId]]" => $form->getId()])
                ->andWhere("$submissions.[[dateCreated]] > :date", ['date' => $date]);

            if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
                $elements = Table::ELEMENTS;
                $query->innerJoin(
                    $elements,
                    "$elements.[[id]] = $submissions.[[id]] AND $elements.[[dateDeleted]] IS NULL"
                );
            }

            $submissionCount = (int) $query->scalar();

            if ($throttleCount <= $submissionCount) {
                $form->addError(Freeform::t('There was an error processing your submission. Please try again later.'));
            }
        }
    }

    /**
     * @return Settings
     */
    public function getSettingsModel(): Settings
    {
        if (null === self::$settingsModel) {
            $plugin              = Freeform::getInstance();
            self::$settingsModel = $plugin->getSettings();
        }

        return self::$settingsModel;
    }

    /**
     * @return array
     */
    public function getSettingsNavigation(): array
    {
        $errorCount = Freeform::getInstance()->logger->getLogReader()->count();

        $nav = [
            'hd'                   => ['heading' => Freeform::t('Settings')],
            'general'              => ['title' => Freeform::t('General Settings')],
            'formatting-templates' => ['title' => Freeform::t('Formatting Templates')],
            'email-templates'      => ['title' => Freeform::t('Email Templates')],
            'statuses'             => ['title' => Freeform::t('Statuses')],
            'demo-templates'       => ['title' => Freeform::t('Demo Templates')],
            'hdspam'               => ['heading' => Freeform::t('Spam')],
            'spam'                 => ['title' => Freeform::t('Spam Settings')],
            'hdapi'                => ['heading' => Freeform::t('API Integrations')],
            'mailing-lists'        => ['title' => Freeform::t('Mailing Lists')],
            'crm'                  => ['title' => Freeform::t('CRM')],
            'payment-gateways'     => ['title' => Freeform::t('Payments')],
            'webhooks'             => ['title' => Freeform::t('Webhooks')],
            'hdlogs'               => ['heading' => Freeform::t('Logs')],
            'error-log'            => ['title' => Freeform::t('Error Log ({count})', ['count' => $errorCount])],
        ];

        if (!$this->isAllowAdminEdit()) {
            unset($nav['hdspam']);
            foreach ($nav as $key => $value) {
                if (!array_key_exists('heading', $value) && $this->isSectionASetting($key)) {
                    unset($nav[$key]);
                }
            }
        }

        $event = new RegisterSettingsNavigationEvent($nav);

        $this->trigger(self::EVENT_REGISTER_SETTINGS_NAVIGATION, $event);

        return $event->getNavigation();
    }

    /**
     * @return bool
     */
    public function isSpamFolderEnabled(): bool
    {
        return (bool) $this->getSettingsModel()->spamFolderEnabled;
    }

    /**
     * @return bool
     */
    public function isAjaxEnabledByDefault(): bool
    {
        return (bool) $this->getSettingsModel()->ajaxByDefault;
    }

    /**
     * @param string $sectionName
     *
     * @return bool
     */
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

        return !in_array($sectionName, $nonSettingSections, true);
    }

    /**
     * @return bool
     */
    public function isAllowAdminEdit(): bool
    {
        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            return \Craft::$app->getConfig()->getGeneral()->allowAdminChanges;
        }

        return true;
    }

    /**
     * @return bool
     */
    public function isOldFreeformInstalled(): bool
    {
        $paths = [
            '/solspace/craft3-freeform',
            '/solspace/craft3-freeform-pro',
            '/solspace/craft3-freeform-payments',
        ];

        $hasOldFreeform = false;
        foreach ($paths as $path) {
            if (is_dir(CRAFT_VENDOR_PATH . $path)) {
                $hasOldFreeform = true;
            }
        }

        return $hasOldFreeform;
    }

    /**
     * @param Form $form
     *
     * @return bool
     */
    private function isMinimumSubmissionTimePassed(Form $form): bool
    {
        $initTime      = $form->getInitTime();
        $timeFormAlive = time() - $initTime;

        $minTime = $this->getSettingsModel()->minimumSubmitTime;

        return $minTime && $timeFormAlive <= $minTime;
    }

    /**
     * @param Form $form
     *
     * @return bool
     */
    private function isMaximumSubmissionTimePassed(Form $form): bool
    {
        $initTime      = $form->getInitTime();
        $timeFormAlive = time() - $initTime;

        $maxTime = $this->getSettingsModel()->formSubmitExpiration;

        return $maxTime && $timeFormAlive >= $maxTime * 60;
    }
}
