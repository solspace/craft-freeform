<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\AbstractExternalOptionsField;
use Solspace\Freeform\Library\Connections\Entries;
use Solspace\Freeform\Library\Connections\Users;
use Solspace\Freeform\Library\DataObjects\Summary\InstallSummary;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Fields;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Forms;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\General;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Other;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Settings;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Spam;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\PluginInfo;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\System;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Totals;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Widgets;
use Solspace\Freeform\Widgets\Pro\FieldValuesWidget;
use Solspace\Freeform\Widgets\Pro\LinearChartsWidget;
use Solspace\Freeform\Widgets\Pro\RadialChartsWidget;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use Solspace\Freeform\Widgets\QuickFormWidget;
use Solspace\Freeform\Widgets\StatisticsWidget;
use yii\base\Component;

class SummaryService extends Component
{
    public function getSummary(): InstallSummary
    {
        $freeform = Freeform::getInstance();
        $craft = \Craft::$app;

        $summary = new InstallSummary();

        $system = new System();
        $system->databaseDriver = \Craft::$app->getDb()->getDriverName();
        $system->phpVersion = \PHP_VERSION;
        $system->craftVersion = $craft->version;
        $system->craftEdition = strtolower($craft->getEditionName());
        $system->formFieldType = \Craft::$app->fields->getFieldsByElementType(FormFieldType::class) > 0;
        $system->submissionsFieldType = \Craft::$app->fields->getFieldsByElementType(SubmissionFieldType::class) > 0;
        $system->userGroups = $craft->userGroups->getAllGroups() > 1;
        $system->multiSite = $craft->sites->getAllSiteIds() > 1;
        $system->languages = $this->hasLanguages();
        $system->legacyFreeform = $freeform->settings->isOldFreeformInstalled();
        $system->plugins = $this->getPlugins();

        $summary->statistics->system = $system;

        $totals = new Totals();
        $totals->forms = \count($freeform->forms->getAllFormIds());
        $totals->fields = \count($freeform->fields->getAllFieldIds());
        $totals->emailNotifications = \count($freeform->notifications->getAllNotifications());
        $totals->submissions = $freeform->submissions->getSubmissionCount();
        $totals->spam = $freeform->submissions->getSubmissionCount(null, null, true);
        $totals->errors = $freeform->logger->getLogReader()->count();

        $summary->statistics->totals = $totals;

        $notifications = $freeform->notifications->getAllNotifications();
        $hasDatabaseNotifications = $hasFileNotifications = false;
        foreach ($notifications as $notification) {
            if (is_numeric($notification->id)) {
                $hasDatabaseNotifications = true;
            }

            if (!is_numeric($notification->id)) {
                $hasFileNotifications = true;
            }
        }

        $composer = $this->extractFromComposer();

        $general = new General();
        $general->databaseNotifications = $hasDatabaseNotifications;
        $general->fileNotifications = $hasFileNotifications;
        $general->customFormattingTemplates = \count($freeform->settings->getCustomFormTemplates()) > 0;
        $general->exportProfiles = \count($freeform->exportProfiles->getAllProfiles()) > 0;
        $general->gtm = $composer->gtmEnabled;
        $general->crm = $this->getCrmIntegrations();
        $general->mailingLists = $this->getMailingListIntegrations();
        $general->webhooks = $this->getWebhooks();
        $general->paymentGateways = $this->getPaymentGateways();
        $general->payments->single = $composer->paymentsSingle;
        $general->payments->subscription = $composer->paymentsSubscription;

        $summary->statistics->general = $general;

        $settingsService = Freeform::getInstance()->settings;

        $settings = new Settings();
        $settings->customPluginName = (bool) $settingsService->getPluginName();
        $settings->defaultView = $settingsService->getSettingsModel()->defaultView;
        $settings->renderHtmlInComposer = $settingsService->isRenderFormHtmlInCpViews();
        $settings->ajaxEnabledByDefault = $settingsService->isAjaxEnabledByDefault();
        $settings->includeDefaultFormattingTemplates = (bool) $settingsService->getSettingsModel()->defaultTemplates;
        $settings->removeNewlinesOnExport = $settingsService->isRemoveNewlines();
        $settings->populateValuesFromGet = (bool) $settingsService->getSettingsModel()->fillWithGet;
        $settings->disableSubmit = $settingsService->isFormSubmitDisable();
        $settings->autoScroll = $settingsService->isAutoScrollToErrors();
        $settings->jsInsertLocation = $settingsService->getSettingsModel()->scriptInsertLocation;
        $settings->purgeSubmissions = (bool) $settingsService->getPurgableSpamAgeInDays();
        $settings->purgeInterval = $settingsService->getPurgableSpamAgeInDays();
        $settings->formattingTemplatesPath = (bool) $settingsService->getSettingsModel()->formTemplateDirectory;
        $settings->sendAlertsOnFailedNotifications = (bool) $settingsService->getFailedNotificationRecipients();
        $settings->notificationTemplatesPath = (bool) $settingsService->getSettingsModel()->emailTemplateDirectory;
        $settings->modifiedStatuses = $this->isModifiedStatuses();
        $settings->demoTemplatesInstalled = $this->isDemoTemplatesInstalled();

        $summary->statistics->settings = $settings;

        $spam = new Spam();
        $spam->honeypot = $settingsService->isFreeformHoneypotEnabled();
        $spam->customHoneypotName = (bool) $settingsService->getSettingsModel()->customHoneypotName;
        $spam->javascriptEnhancement = $settingsService->isFreeformHoneypotEnhanced();
        $spam->spamProtectionBehaviour = $settingsService->getSettingsModel()->spamProtectionBehaviour;
        $spam->spamFolder = $settingsService->isSpamFolderEnabled();
        $spam->purgeSpam = (bool) $settingsService->getPurgableSpamAgeInDays();
        $spam->purgeInterval = $settingsService->getPurgableSpamAgeInDays();
        $spam->blockEmail = (bool) $settingsService->getSettingsModel()->blockedEmails;
        $spam->blockKeywords = (bool) $settingsService->getSettingsModel()->blockedKeywords;
        $spam->blockIp = (bool) $settingsService->getSettingsModel()->blockedIpAddresses;
        $spam->submissionThrottling = (bool) $settingsService->getSettingsModel()->submissionThrottlingCount;
        $spam->minSubmitTime = (bool) $settingsService->getSettingsModel()->minimumSubmitTime;
        $spam->submitExpiration = (bool) $settingsService->getSettingsModel()->formSubmitExpiration;
        $spam->recaptcha = (bool) $settingsService->getSettingsModel()->recaptchaEnabled;
        $spam->recaptchaType = $spam->recaptcha ? $settingsService->getSettingsModel()->recaptchaType : '';

        $summary->statistics->spam = $spam;

        $fieldTypes = $composer->fieldTypes;

        $fields = new Fields();
        $fields->text = $this->usesField('text', $fieldTypes);
        $fields->textarea = $this->usesField('textarea', $fieldTypes);
        $fields->email = $this->usesField('email', $fieldTypes);
        $fields->hidden = $this->usesField('hidden', $fieldTypes);
        $fields->select = $this->usesField('select', $fieldTypes);
        $fields->multiSelect = $this->usesField('multiple_select', $fieldTypes);
        $fields->checkbox = $this->usesField('checkbox', $fieldTypes);
        $fields->checkboxGroup = $this->usesField('checkbox_group', $fieldTypes);
        $fields->radioGroup = $this->usesField('radio_group', $fieldTypes);
        $fields->file = $this->usesField('file', $fieldTypes);
        $fields->number = $this->usesField('number', $fieldTypes);
        $fields->dynamicRecipients = $this->usesField('dynamic_recipients', $fieldTypes);
        $fields->dateTime = $this->usesField('datetime', $fieldTypes);
        $fields->phone = $this->usesField('phone', $fieldTypes);
        $fields->rating = $this->usesField('rating', $fieldTypes);
        $fields->regex = $this->usesField('regex', $fieldTypes);
        $fields->website = $this->usesField('website', $fieldTypes);
        $fields->opinionScale = $this->usesField('opinion_scale', $fieldTypes);
        $fields->signature = $this->usesField('signature', $fieldTypes);
        $fields->table = $this->usesField('table', $fieldTypes);
        $fields->invisible = $this->usesField('invisible', $fieldTypes);
        $fields->html = $this->usesField('html', $fieldTypes);
        $fields->richText = $this->usesField('rich_text', $fieldTypes);
        $fields->confirm = $this->usesField('confirmation', $fieldTypes);
        $fields->password = $this->usesField('password', $fieldTypes);
        $fields->usingSource = $composer->usingSource;

        $summary->statistics->fields = $fields;

        $forms = new Forms();
        $forms->multiPage = $composer->multiPage;
        $forms->builtInAjax = $composer->builtInAjax;
        $forms->notStoringSubmissions = $composer->notStoringSubmissions;
        $forms->collectIp = $composer->collectIp;
        $forms->optInDataStorage = $composer->optInDataStorage;
        $forms->limitSubmissionRate = $composer->limitSubmissionRate;
        $forms->formTagAttributes = $composer->formTagAttributes;
        $forms->adminNotifications = $composer->adminNotifications;
        $forms->loadingIndicators = $composer->loadingIndicators;
        $forms->conditionalRules->fields = $composer->conditionalRulesFields;
        $forms->conditionalRules->pages = $composer->conditionalRulesPages;
        $forms->elementConnections->entries = $composer->elementConnectionsEntries;
        $forms->elementConnections->users = $composer->elementConnectionsUsers;

        $summary->statistics->forms = $forms;

        $widgets = new Widgets();
        $widgets->linear = $this->isWidgetUsed(LinearChartsWidget::class);
        $widgets->radial = $this->isWidgetUsed(RadialChartsWidget::class);
        $widgets->fieldValues = $this->isWidgetUsed(FieldValuesWidget::class);
        $widgets->recent = $this->isWidgetUsed(RecentWidget::class);
        $widgets->quickForm = $this->isWidgetUsed(QuickFormWidget::class);
        $widgets->stats = $this->isWidgetUsed(StatisticsWidget::class);

        $summary->statistics->widgets = $widgets;

        $feedInfo = $freeform->settings->getSettingsModel()->feedInfo ?? [];

        $other = new Other();
        $other->jsFramework = \in_array('jsFramework', $feedInfo, true);
        $other->caching = \in_array('caching', $feedInfo, true);
        $other->customModule = \in_array('customModule', $feedInfo, true);
        $other->gdpr = \in_array('gdpr', $feedInfo, true);
        $other->editingSubmissions = \in_array('editingSubmissions', $feedInfo, true);
        $other->displayingSubmissions = \in_array('displayingSubmissions', $feedInfo, true);

        $summary->statistics->other = $other;

        return $summary;
    }

    private function isWidgetUsed(string $widgetClass)
    {
        static $widgets;

        if (null === $widgets) {
            $widgets = (new Query())
                ->select('type')
                ->from(Table::WIDGETS)
                ->groupBy('type')
                ->column()
            ;
        }

        return \in_array($widgetClass, $widgets, true);
    }

    private function isDemoTemplatesInstalled(): bool
    {
        $path = \Craft::getAlias('@templates').'/freeform-demo';

        return file_exists($path) && is_dir($path);
    }

    private function isModifiedStatuses(): bool
    {
        $statuses = Freeform::getInstance()->statuses->getAllStatusNames();

        if (3 === !\count($statuses)) {
            return true;
        }

        if (array_keys($statuses) != [1, 2, 3]) {
            return true;
        }

        if ('Pending' !== $statuses[1] || 'Open' !== $statuses[2] || 'Closed' !== $statuses[3]) {
            return true;
        }

        return false;
    }

    private function usesField(string $type, array $types): bool
    {
        return \in_array($type, $types, true);
    }

    private function extractFromComposer(): \stdClass
    {
        $forms = Freeform::getInstance()->forms->getAllForms();

        $paymentSingle = false;
        $paymentSubscription = false;
        $fieldTypes = [];
        $usingSource = false;
        $multiPage = false;
        $builtInAjax = false;
        $notStoringSubmissions = false;
        $postForwarding = false;
        $collectIp = false;
        $optInDataStorage = false;
        $limitSubmissionRate = false;
        $formTagAttributes = false;
        $adminNotifications = false;
        $loadingIndicators = false;
        $conditionalRulesFields = false;
        $conditionalRulesPages = false;
        $elementConnectionsEntries = false;
        $elementConnectionsUsers = false;
        $gtmEnabled = false;

        foreach ($forms as $formModel) {
            $form = $formModel->getForm();

            if (\count($form->getPages()) > 1) {
                $multiPage = true;
            }

            if ($form->isAjaxEnabled()) {
                $builtInAjax = true;
            }

            if (!$form->isStoreData()) {
                $notStoringSubmissions = true;
            }

            if ($form->getExtraPostUrl()) {
                $postForwarding = true;
            }

            if ($form->isIpCollectingEnabled()) {
                $collectIp = true;
            }

            if ($form->getOptInDataStorageTargetHash()) {
                $optInDataStorage = true;
            }

            if ($form->getLimitFormSubmissions()) {
                $limitSubmissionRate = true;
            }

            if ($form->getTagAttributes()) {
                $formTagAttributes = true;
            }

            if ($form->getAdminNotificationProperties()->getRecipients() && $form->getAdminNotificationProperties(
                )->getNotificationId()) {
                $adminNotifications = true;
            }

            if ($form->isShowLoadingText() || $form->isShowSpinner()) {
                $loadingIndicators = true;
            }

            if ($form->isGtmEnabled()) {
                $gtmEnabled = true;
            }

            foreach ($form->getPages() as $page) {
                if (!$form->getRuleProperties()) {
                    continue;
                }

                if ($form->getRuleProperties()->hasActiveFieldRules($page->getIndex())) {
                    $conditionalRulesFields = true;
                }

                if ($form->getRuleProperties()->hasActiveGotoRules($page->getIndex())) {
                    $conditionalRulesPages = true;
                }
            }

            foreach ($form->getConnectionProperties()->getList() as $connection) {
                if ($connection instanceof Entries) {
                    $elementConnectionsEntries = true;
                }

                if ($connection instanceof Users) {
                    $elementConnectionsUsers = true;
                }
            }

            foreach ($form->getLayout()->getFields() as $field) {
                $fieldTypes[] = $field->getType();

                if ($field instanceof AbstractExternalOptionsField) {
                    if (!\in_array(
                        $field->getOptionSource(),
                        [AbstractExternalOptionsField::SOURCE_CUSTOM, AbstractExternalOptionsField::SOURCE_PREDEFINED],
                        true
                    )) {
                        $usingSource = true;
                    }
                }
            }

            $layout = json_decode($formModel->layoutJson, false);
            if (isset($layout->composer->properties->payment)) {
                $paymentType = $layout->composer->properties->payment->paymentType ?? null;
                if ('single' === $paymentType) {
                    $paymentSingle = true;
                }

                if (\in_array($paymentType, ['predefined_subscription', 'dynamic_subscription'], true)) {
                    $paymentSubscription = true;
                }
            }
        }

        $fieldTypes = array_unique($fieldTypes);
        $fieldTypes = array_filter($fieldTypes);

        return (object) [
            'paymentsSingle' => $paymentSingle,
            'paymentsSubscription' => $paymentSubscription,
            'fieldTypes' => $fieldTypes,
            'usingSource' => $usingSource,
            'multiPage' => $multiPage,
            'builtInAjax' => $builtInAjax,
            'notStoringSubmissions' => $notStoringSubmissions,
            'postForwarding' => $postForwarding,
            'collectIp' => $collectIp,
            'optInDataStorage' => $optInDataStorage,
            'limitSubmissionRate' => $limitSubmissionRate,
            'formTagAttributes' => $formTagAttributes,
            'adminNotifications' => $adminNotifications,
            'loadingIndicators' => $loadingIndicators,
            'conditionalRulesFields' => $conditionalRulesFields,
            'conditionalRulesPages' => $conditionalRulesPages,
            'elementConnectionsEntries' => $elementConnectionsEntries,
            'elementConnectionsUsers' => $elementConnectionsUsers,
            'gtmEnabled' => $gtmEnabled,
        ];
    }

    private function getPaymentGateways(): array
    {
        $integrations = [];
        foreach (Freeform::getInstance()->paymentGateways->getAllIntegrations() as $integration) {
            $integrations[] = $integration->class;
        }

        return $integrations;
    }

    private function getWebhooks(): array
    {
        $integrations = [];
        foreach (Freeform::getInstance()->webhooks->getAll() as $webhook) {
            $integrations[] = $webhook->type;
        }

        return $integrations;
    }

    private function getMailingListIntegrations(): array
    {
        $integrations = [];
        foreach (Freeform::getInstance()->mailingLists->getAllIntegrations() as $integration) {
            $integrations[] = $integration->class;
        }

        return $integrations;
    }

    private function getCrmIntegrations(): array
    {
        $integrations = [];
        foreach (Freeform::getInstance()->crm->getAllIntegrations() as $integration) {
            $integrations[] = $integration->class;
        }

        return $integrations;
    }

    private function getPlugins(): array
    {
        $result = (new Query())
            ->select(['handle', 'installDate', 'version', 'licenseKeyStatus'])
            ->from('{{%plugins}}')
            ->all()
        ;

        $pluginInfo = [];
        foreach ($result as $item) {
            $pluginInfo[$item['handle']] = $item;
        }

        $plugins = [];
        foreach (\Craft::$app->projectConfig->get('plugins') as $handle => $info) {
            if (!$info['enabled']) {
                continue;
            }

            $dbInfo = $pluginInfo[$handle];

            $plugin = new PluginInfo();
            $plugin->edition = $info['edition'];
            $plugin->version = $dbInfo['version'] ?? '';
            $plugin->installDate = $dbInfo['installDate'] ? new Carbon($dbInfo['installDate'], 'UTC') : null;
            $plugin->license = $dbInfo['licenseKeyStatus'] ?? null;

            $plugins[$handle] = $plugin;
        }

        return $plugins;
    }

    private function hasLanguages(): bool
    {
        $language = null;
        $sites = \Craft::$app->sites->getAllSites();
        foreach ($sites as $site) {
            if (null === $language) {
                $language = $site->language;

                continue;
            }

            if ($language !== $site->language) {
                return true;
            }
        }

        return false;
    }
}
