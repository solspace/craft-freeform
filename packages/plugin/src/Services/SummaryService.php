<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Connections\Entries;
use Solspace\Freeform\Library\Connections\Users;
use Solspace\Freeform\Library\DataObjects\Summary\InstallSummary;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Fields;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Forms;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\General;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Settings;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Spam;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\SubStats\PluginInfo;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\System;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Totals;
use Solspace\Freeform\Library\DataObjects\Summary\Statistics\Widgets;
use Solspace\Freeform\Library\Helpers\ArrayHelper;
use Solspace\Freeform\Widgets\Pro\LinearChartsWidget;
use Solspace\Freeform\Widgets\Pro\RadialChartsWidget;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use Solspace\Freeform\Widgets\QuickFormWidget;
use yii\base\Component;

class SummaryService extends Component
{
    public function getSummary(): InstallSummary
    {
        $freeform = Freeform::getInstance();
        $craft = \Craft::$app;

        $craftFields = \Craft::$app->fields->getAllFields();

        $summary = new InstallSummary();

        $system = new System();
        $system->databaseDriver = \Craft::$app->getDb()->getDriverName();
        $system->phpVersion = \PHP_VERSION;
        $system->craftVersion = $craft->version;
        $system->craftEdition = strtolower($craft->getEditionName());
        $system->formFieldType = ArrayHelper::some($craftFields, fn ($item) => FormFieldType::class === $item::class);
        $system->submissionsFieldType = ArrayHelper::some($craftFields, fn ($item) => SubmissionFieldType::class === $item::class);
        $system->userGroups = $craft->userGroups->getAllGroups() > 1;
        $system->multiSite = $craft->sites->getAllSiteIds() > 1;
        $system->languages = $this->hasLanguages();
        $system->plugins = $this->getPlugins();

        $summary->statistics->system = $system;

        $totals = new Totals();
        $totals->forms = \count($freeform->forms->getAllFormIds());
        $totals->regularForm = \count($freeform->forms->getAllFormIds(Regular::class));
        $totals->fields = $freeform->fields->getAllFieldCount();
        $totals->favoriteFields = $freeform->fields->getFavoriteFieldCount();
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
        $general->mailingLists = $this->getEmailMarketingIntegrations();
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
        $settings->includeDefaultFormattingTemplates = $settingsService->getSettingsModel()->defaults->includeSampleTemplates;
        $settings->removeNewlinesOnExport = $settingsService->isRemoveNewlines();
        $settings->populateValuesFromGet = (bool) $settingsService->getSettingsModel()->fillWithGet;
        $settings->disableSubmit = $settingsService->isFormSubmitDisable();
        $settings->autoScroll = $settingsService->isAutoScrollToErrors();
        $settings->jsInsertLocation = $settingsService->getSettingsModel()->scriptInsertLocation;
        $settings->jsInsertType = $settingsService->getSettingsModel()->scriptInsertType;
        $settings->sessionContextType = $settingsService->getSettingsModel()->sessionContext;
        $settings->purgeSubmissions = (bool) $settingsService->getPurgableSubmissionAgeInDays();
        $settings->purgeInterval = $settingsService->getPurgableSubmissionAgeInDays();
        $settings->formattingTemplatesPath = (bool) $settingsService->getSettingsModel()->formTemplateDirectory;
        $settings->sendAlertsOnFailedNotifications = (bool) $settingsService->getFailedNotificationRecipients();
        $settings->notificationTemplatesPath = (bool) $settingsService->getSettingsModel()->emailTemplateDirectory;
        $settings->successTemplatesPath = (bool) $settingsService->getSettingsModel()->successTemplateDirectory;
        $settings->modifiedStatuses = $this->isModifiedStatuses();
        $settings->demoTemplatesInstalled = $this->isDemoTemplatesInstalled();

        $summary->statistics->settings = $settings;

        $spam = new Spam();
        $spam->spamProtectionBehavior = $settingsService->getSettingsModel()->spamProtectionBehavior;
        $spam->spamFolder = $settingsService->isSpamFolderEnabled();
        $spam->purgeSpam = (bool) $settingsService->getPurgableSpamAgeInDays();
        $spam->purgeInterval = $settingsService->getPurgableSpamAgeInDays();
        $spam->blockEmail = (bool) $settingsService->getSettingsModel()->blockedEmails;
        $spam->blockKeywords = (bool) $settingsService->getSettingsModel()->blockedKeywords;
        $spam->blockIp = (bool) $settingsService->getSettingsModel()->blockedIpAddresses;
        $spam->submissionThrottling = (bool) $settingsService->getSettingsModel()->submissionThrottlingCount;
        $spam->minSubmitTime = (bool) $settingsService->getSettingsModel()->minimumSubmitTime;
        $spam->submitExpiration = (bool) $settingsService->getSettingsModel()->formSubmitExpiration;
        $spam->submissionThrottlingCount = (int) $settingsService->getSettingsModel()->submissionThrottlingCount;
        $spam->bypassSpamCheckOnLoggedInUsers = $settingsService->getSettingsModel()->bypassSpamCheckOnLoggedInUsers;

        // TODO: reimplement using integrations
        // $spam->captcha = (bool) $settingsService->getSettingsModel()->recaptchaEnabled;
        // $spam->captchaType = $spam->captcha ? $settingsService->getSettingsModel()->recaptchaType : '';

        $summary->statistics->spam = $spam;

        $fieldTypes = $composer->fieldTypes;

        $fields = new Fields();
        $fields->text = $this->usesField('text', $fieldTypes);
        $fields->textarea = $this->usesField('textarea', $fieldTypes);
        $fields->email = $this->usesField('email', $fieldTypes);
        $fields->hidden = $this->usesField('hidden', $fieldTypes);
        $fields->select = $this->usesField('dropdown', $fieldTypes);
        $fields->multiSelect = $this->usesField('multiple-select', $fieldTypes);
        $fields->checkbox = $this->usesField('checkbox', $fieldTypes);
        $fields->checkboxGroup = $this->usesField('checkboxes', $fieldTypes);
        $fields->radioGroup = $this->usesField('radios', $fieldTypes);
        $fields->file = $this->usesField('file', $fieldTypes);
        $fields->fileDragAndDrop = $this->usesField('file-dnd', $fieldTypes);
        $fields->number = $this->usesField('number', $fieldTypes);
        $fields->dateTime = $this->usesField('datetime', $fieldTypes);
        $fields->phone = $this->usesField('phone', $fieldTypes);
        $fields->rating = $this->usesField('rating', $fieldTypes);
        $fields->regex = $this->usesField('regex', $fieldTypes);
        $fields->website = $this->usesField('website', $fieldTypes);
        $fields->opinionScale = $this->usesField('opinion-scale', $fieldTypes);
        $fields->signature = $this->usesField('signature', $fieldTypes);
        $fields->table = $this->usesField('table', $fieldTypes);
        $fields->invisible = $this->usesField('invisible', $fieldTypes);
        $fields->html = $this->usesField('html', $fieldTypes);
        $fields->richText = $this->usesField('rich-text', $fieldTypes);
        $fields->confirm = $this->usesField('confirm', $fieldTypes);
        $fields->password = $this->usesField('password', $fieldTypes);
        $fields->saveAndContinue = $this->usesField('save', $fieldTypes);
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
        $forms->types = $composer->types;

        $summary->statistics->forms = $forms;

        $widgets = new Widgets();
        $widgets->linear = $this->isWidgetUsed(LinearChartsWidget::class);
        $widgets->radial = $this->isWidgetUsed(RadialChartsWidget::class);
        $widgets->recent = $this->isWidgetUsed(RecentWidget::class);
        $widgets->quickForm = $this->isWidgetUsed(QuickFormWidget::class);

        $summary->statistics->widgets = $widgets;

        return $summary;
    }

    private function isWidgetUsed(string $widgetClass): bool
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
        $types = [];

        foreach ($forms as $form) {
            $settings = $form->getSettings();
            $generalSettings = $settings->getGeneral();
            $behaviorSettings = $settings->getBehavior();

            $type = $form::class;
            if (!\in_array($type, $types, true)) {
                $types[] = $type;
            }

            if (\count($form->getPages()) > 1) {
                $multiPage = true;
            }

            if ($form->isAjaxEnabled()) {
                $builtInAjax = true;
            }

            if (!$generalSettings->storeData) {
                $notStoringSubmissions = true;
            }

            // if ($form->getExtraPostUrl()) {
            //     $postForwarding = true;
            // }

            if ($generalSettings->collectIpAddresses) {
                $collectIp = true;
            }

            if ($generalSettings->optInCheckbox) {
                $optInDataStorage = true;
            }

            if ($behaviorSettings->duplicateCheck) {
                $limitSubmissionRate = true;
            }

            if ($form->getAttributes()->count()) {
                $formTagAttributes = true;
            }

            // $recipients = $form->getAdminNotificationProperties()->getRecipients();
            // $notificationId = $form->getAdminNotificationProperties()->getNotificationId();
            // if ($recipients && $notificationId) {
            //     $adminNotifications = true;
            // }

            if ($behaviorSettings->showProcessingText || $behaviorSettings->showProcessingSpinner) {
                $processingIndicators = true;
            }

            // if ($form->isGtmEnabled()) {
            //     $gtmEnabled = true;
            // }

            // foreach ($form->getPages() as $page) {
            //     if (!$form->getRuleProperties()) {
            //         continue;
            //     }
            //
            //     if ($form->getRuleProperties()->hasActiveFieldRules($page->getIndex())) {
            //         $conditionalRulesFields = true;
            //     }
            //
            //     if ($form->getRuleProperties()->hasActiveGotoRules($page->getIndex())) {
            //         $conditionalRulesPages = true;
            //     }
            // }

            // foreach ($form->getConnectionProperties()->getList() as $connection) {
            //     if ($connection instanceof Entries) {
            //         $elementConnectionsEntries = true;
            //     }
            //
            //     if ($connection instanceof Users) {
            //         $elementConnectionsUsers = true;
            //     }
            // }

            foreach ($form->getLayout()->getFields() as $field) {
                $fieldTypes[] = $field->getType();

                if ($field instanceof OptionsConfigurationInterface) {
                    $configuration = $field->getOptionConfiguration();
                    $source = $configuration->getSource();

                    if (!\in_array(
                        $source,
                        [
                            OptionsConfigurationInterface::SOURCE_CUSTOM,
                            OptionsConfigurationInterface::SOURCE_PREDEFINED,
                        ],
                        true
                    )) {
                        $usingSource = true;
                    }
                }
            }
        }

        $fieldTypes = array_unique($fieldTypes);
        $fieldTypes = array_filter($fieldTypes);

        return (object) [
            'paymentsSingle' => false,
            'paymentsSubscription' => false,
            'fieldTypes' => $fieldTypes,
            'usingSource' => $usingSource,
            'multiPage' => $multiPage,
            'builtInAjax' => $builtInAjax,
            'notStoringSubmissions' => $notStoringSubmissions,
            'postForwarding' => false,
            'collectIp' => $collectIp,
            'optInDataStorage' => $optInDataStorage,
            'limitSubmissionRate' => $limitSubmissionRate,
            'formTagAttributes' => $formTagAttributes,
            'adminNotifications' => false,
            'loadingIndicators' => false,
            'conditionalRulesFields' => false,
            'conditionalRulesPages' => false,
            'elementConnectionsEntries' => false,
            'elementConnectionsUsers' => false,
            'gtmEnabled' => false,
            'types' => $types,
        ];
    }

    private function getPaymentGateways(): array
    {
        $classes = [];

        $integrations = Freeform::getInstance()->integrations->getAllIntegrations(Type::TYPE_PAYMENT_GATEWAYS);
        foreach ($integrations as $integration) {
            $classes[] = $integration::class;
        }

        return $classes;
    }

    private function getWebhooks(): array
    {
        $classes = [];

        $integrations = Freeform::getInstance()->integrations->getAllIntegrations(Type::TYPE_WEBHOOKS);
        foreach ($integrations as $integration) {
            $classes[] = $integration::class;
        }

        return $classes;
    }

    private function getEmailMarketingIntegrations(): array
    {
        $classes = [];

        $integrations = Freeform::getInstance()->integrations->getAllIntegrations(Type::TYPE_EMAIL_MARKETING);
        foreach ($integrations as $integration) {
            $classes[] = $integration::class;
        }

        return $classes;
    }

    private function getCrmIntegrations(): array
    {
        $classes = [];

        $integrations = Freeform::getInstance()->integrations->getAllIntegrations(Type::TYPE_CRM);
        foreach ($integrations as $integration) {
            $classes[] = $integration::class;
        }

        return $classes;
    }

    private function getPlugins(): array
    {
        $result = (new Query())
            ->select(['handle', 'installDate', 'version'])
            ->from('{{%plugins}}')
            ->all()
        ;

        $pluginInfo = [];
        foreach ($result as $item) {
            $pluginInfo[$item['handle']] = $item;
        }

        $plugins = [];
        foreach (\Craft::$app->projectConfig->get('plugins') as $handle => $info) {
            if (!isset($info['enabled']) || !$info['enabled']) {
                continue;
            }

            $dbInfo = $pluginInfo[$handle] ?? null;
            $installDate = $dbInfo['installDate'] ?? null;

            $plugin = new PluginInfo();
            $plugin->edition = $info['edition'] ?? 'lite';
            $plugin->version = $dbInfo['version'] ?? '';
            $plugin->installDate = $installDate ? new Carbon($installDate, 'UTC') : null;

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
